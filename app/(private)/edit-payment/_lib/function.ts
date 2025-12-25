import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { PaymentType, SelectType, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { EditPaymentFormValues, EditPaymentInitData, UserAndCompaniesEmploymentStatus } from './types';

/* 支払い情報の更新
------------------------------------------------------------------ */

/**
 * getUserProfileInitData
 * 「会員情報の変更」の初期表示情報を取得する。
 *
 * @param {ApiRequest<null>} values - いらないかも！
 * @returns {Promise<EditPaymentInitData>} 初期表示情報
 */
export const getEditPaymentTypeInitData = async (
  values: ApiRequest<number>
): Promise<ApiResponse<EditPaymentInitData>> => {
  const supabase = await createClient();

  try {
    /* ユーザー情報の取得
    ------------------------------------------------------------------ */
    const userEmail: string = (await supabase.auth.getUser()).data.user?.email ?? '';
    const query = supabase
      .from('t_user')
      .select(
        `
        payment_type,
        credit_member_id,
        t_companies_employment_status!inner(
        deduction_flag,
        credit_flag,
        paypay_flag
      )`
      )
      .eq('user_email', userEmail)
      .eq('usage_status', UsageStatus.AVAILABLE)
      .eq('user_registration_status', UserRegistrationStatus.REGISTERED)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserAndCompaniesEmploymentStatus>;

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '支払い情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return {
      success: true,
      data: {
        currentPaymentType: data.payment_type as PaymentType,
        currentCardDataId: undefined,
        creditCardDatas: undefined,
        credit_flag: data.t_companies_employment_status.credit_flag as SelectType,
        deduction_flag: data.t_companies_employment_status.deduction_flag as SelectType,
        paypay_flag: data.t_companies_employment_status.paypay_flag as SelectType,
      },
    };
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};

/**
 * registerPaymentType
 * 支払い情報を更新する。
 *
 * @param { ApiRequest<EditPaymentFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const updatePaymentType = async (values: ApiRequest<EditPaymentFormValues>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const now = getNow();
  const supabase = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* Update - t_user
  　------------------------------------------------------------------ */
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user.user.email) {
      throw new CustomError(ErrorCodes.LOGGED_OUT);
    }
    console.log('user.user.email', user.user.email);

    /* Update - t_user
  　------------------------------------------------------------------ */
    const selectSql = `
      UPDATE
        t_user
      SET
        payment_type = $1,
        updated_at = $2
      WHERE
        user_email = $3
      AND
        user_registration_status = $4
      AND
        usage_status = $5;`;

    // Insert
    const values = [req.paymentType, now, user.user.email, UserRegistrationStatus.REGISTERED, UsageStatus.AVAILABLE];
    const domainCheck = await pgClient.query(selectSql, values);
    if (!domainCheck.rowCount) {
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        '支払い方法の更新' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    /* クレジットカード登録
  　------------------------------------------------------------------ */
    // MEMO: 念のため残しておく。ロールバック不要になったら、supabase-jsのみに変更修正。

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: e,
      };
    }
    return {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};
