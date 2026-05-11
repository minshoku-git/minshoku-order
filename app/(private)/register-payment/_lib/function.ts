import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { PaymentType, SelectType, UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { RegisterPaymentInitData, UserAndCompaniesEmploymentStatus, UserPaymentFormValues } from './types';
import { saveGmoMember, saveGmoCard, searchGmoCards } from './gmoApi';
/* 支払い情報の新規登録
------------------------------------------------------------------ */

/**
 * getUserProfileInitData
 * 「会員情報の変更」の初期表示情報を取得する。
 *
 * @returns {Promise<RegisterPaymentInitData>} 初期表示情報
 */
export const getEditPaymentTypeInitData = async (): Promise<ApiResponse<RegisterPaymentInitData>> => {
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
      .eq('user_registration_status', UserRegistrationStatus.WAITING_PAYMENT_SETUP)
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
 * 支払い情報を新規登録し、ステータス類を更新する。
 *
 * @param { ApiRequest<UserPaymentFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const registerPaymentType = async (values: ApiRequest<UserPaymentFormValues>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const now = getNow();
  const supabase = await createClient();
  const pgClient = await createPgClient();

  try {
    await pgClient.query('BEGIN');

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user?.email) throw new CustomError(ErrorCodes.LOGGED_OUT);

    // 1. ユーザーIDを取得して12桁のMemberIDを生成
    const { data: userData } = await supabase
      .from('t_user')
      .select('id')
      .eq('user_email', authData.user.email)
      .single();

    if (!userData) throw new Error('ユーザーが見つかりません');
    const memberId = String(userData.id).padStart(12, '0'); // ★12桁0埋め

    let finalCardSeq = '';

    /* 2. クレジットカード登録 (GMO連携)
    ------------------------------------------------------------------ */
    if (req.paymentType === PaymentType.CREDITCARD && req.token) {
      // GMO会員登録
      const memberRes = await saveGmoMember(memberId);
      if (!memberRes.success) throw new Error(`GMO会員登録失敗: ${memberRes.errInfo}`);

      // GMOカード登録
      const cardRes = await saveGmoCard(memberId, req.token);
      if (cardRes.ErrCode) throw new Error(`GMOカード登録失敗: ${cardRes.ErrInfo}`);

      finalCardSeq = cardRes.CardSeq || '0';
    }

    /* 3. DB更新 (t_user)
    ------------------------------------------------------------------ */
    const updateSql = `
      UPDATE t_user
      SET
        payment_type = $1,
        user_registration_status = $2,
        credit_member_id = $3,
        credit_seq_choice = $4,
        updated_at = $5
      WHERE
        user_email = $6
      AND
        user_registration_status = $7
      AND
        usage_status = $8;`;

    const updateValues = [
      req.paymentType,
      UserRegistrationStatus.REGISTERED, // 完了ステータスへ
      memberId,         // 12桁ID
      finalCardSeq,     // カード連番
      now,
      authData.user.email,
      UserRegistrationStatus.WAITING_PAYMENT_SETUP,
      UsageStatus.AVAILABLE,
    ];

    const result = await pgClient.query(updateSql, updateValues);
    if (!result.rowCount) throw new Error('DB更新に失敗しました');

    await pgClient.query('COMMIT');
    return { success: true, data: null };

  } catch (e: any) {
    await pgClient.query('ROLLBACK');
    console.error('Registration failed:', e);
    return { success: false, error: { code: 'REGISTER_ERROR', message: e.message } };
  } finally {
    await pgClient.end();
  }
};
