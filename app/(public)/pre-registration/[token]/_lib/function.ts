import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { decrypt } from '@/app/_lib/encryption/crypto';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getNow } from '@/app/_lib/utils/getDateTime';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { NextPageDecrypt, NextPageInitRequest } from './types';

/* 仮登録完了
------------------------------------------------------------------ */
/**
 * 仮登録
 * ※登録ステータスを「支払方法登録待ち」に変更して、ログインを行う。
 * @param {ApiRequest<UserLoginFormValues>} values
 * @returns {Promise<ApiResponse<null>>}
 */
export const preregister = async (values: ApiRequest<NextPageInitRequest>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const timestamp = getNow();
  const supabase = await createClient();

  // connection Start
  const pgClient = await createPgClient();

  try {
    // Transaction Start
    await pgClient.query('BEGIN');

    /* 復号化
    ------------------------------------------------------------------ */
    const decryptToken: string = decrypt(req.token);
    const decryptRes: NextPageDecrypt = JSON.parse(decryptToken);
    console.log('復号化結果:' + decryptRes.id);

    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const queryUser = supabase
      .from('t_user')
      .select('user_email,user_registration_status,usage_status,signup_password')
      .eq('id', decryptRes.id)
      .single();

    const { data: dataUser, error: errorUser } = (await queryUser) as PostgrestSingleResponse<t_user>;

    if (errorUser) {
      console.error(errorUser);
      throw new CustomError(ErrorCodes.INVALID_RECOVERY_LINK);
    }

    /* ステータス更新
    ------------------------------------------------------------------ */
    if (UserRegistrationStatus.WAITING_EMAIL_VERIFICATION) {
      const query = supabase
        .from('t_user')
        .update<t_user>({
          user_registration_status: UserRegistrationStatus.WAITING_PAYMENT_SETUP,
          usage_status: UsageStatus.AVAILABLE,
          updated_at: timestamp,
        })
        .eq('id', decryptRes.id)
        .eq('user_registration_status', UserRegistrationStatus.WAITING_EMAIL_VERIFICATION)
        .eq('usage_status', UsageStatus.DEACTIVATION);
      const { error } = (await query) as PostgrestSingleResponse<t_user>;

      if (error) {
        console.error(error);
        throw new CustomError(ErrorCodes.INVALID_RECOVERY_LINK);
      }
    }

    /* パスワード復号化
    ------------------------------------------------------------------ */
    const decryptPassword: string = decrypt(dataUser.signup_password!);

    /* ログイン
    ------------------------------------------------------------------ */
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: dataUser.user_email!,
      password: decryptPassword,
    });

    if (signInError) {
      console.error(signInError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ログイン' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
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
