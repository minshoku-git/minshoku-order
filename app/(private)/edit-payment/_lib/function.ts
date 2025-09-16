import { getNow } from '@/app/_lib/getDateTime';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserPaymentFormValues } from './types';

/* 支払い情報新規登録
------------------------------------------------------------------ */
/**
 * updatePaymentType
 * 支払い情報を新規登録する。
 *
 * @param { ApiRequest<UserPaymentFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const updatePaymentType = async (values: ApiRequest<UserPaymentFormValues>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const supabase = await createClient();
  const pgClient = createPgClient();
  const now = getNow();

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* Update - t_user
  　------------------------------------------------------------------ */
    const selectSql = `
      UPDATE
        t_user
      SET
        payment_type = ${req.payment_type},
        user_registration_status = ${UserRegistrationStatus.REGISTERED},
        usage_status = ${UsageStatus.AVAILABLE},
        updated_at = ${now}
      WHERE
        id = ${'id'}
      AND
        user_registration_status = ${UserRegistrationStatus.WAITING_PAYMENT_SETUP}
      AND
        usage_status = ${UsageStatus.DEACTIVATION};`;

    // Insert
    const domainCheck = await pgClient.query(selectSql);
    if (!domainCheck.rowCount) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ユーザー情報の更新' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* クレジットカード登録
  　------------------------------------------------------------------ */
    // TODO:クレジットカード登録

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
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};
