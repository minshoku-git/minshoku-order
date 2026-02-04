import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { PasswordFormValues } from './types';

/* ユーザーログイン
------------------------------------------------------------------ */
/**
 * ログイン
 * @param {ApiRequest<PasswordFormValues>} req
 * @returns {Promise<ApiResponse<null>>}
 */
export const sendPasswordResetMail = async (req: ApiRequest<PasswordFormValues>): Promise<ApiResponse<null>> => {
  const supabase = await createClient();
  const { email } = req.request;

  try {
    /* メールアドレスの存在確認
  　------------------------------------------------------------------ */
    const query = supabase.from('t_user').select('*').eq('user_email', email).maybeSingle();
    const { data, error } = (await query) as PostgrestSingleResponse<t_user>;

    if (error) {
      // 予期しないエラー
      console.error('Error signing in:', error);
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
    }
    if (!data) {
      // メールアドレスが未登録の場合
      console.error('Error signing in:', error);
      throw new CustomError(ErrorCodes.EMAIL_NOT_REGISTERED);
    }

    // // ステータス確認
    // // TASK: 権限確認
    // if (
    //   data.usage_status === UsageStatus.AVAILABLE &&
    //   data.user_registration_status === UserRegistrationStatus.REGISTERED
    // ) {
    //   // 登録ステータスが登録済み && 利用ステータスが利用可能の場合
    //   // OK!!
    // }else{
    //   // 登録ステータスが登録済み && 利用ステータスが利用可能以外の場合
    //   throw new CustomError(ErrorCodes.ACCOUNT_SUSPENDED);
    // }

    /* パスワードリセット送信
  　------------------------------------------------------------------ */
    // TODO:URL差し替え
    const { error: signInError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.APP_URL_DEV + '/reset-password',
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'パスワードリセット送信' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    return { success: true, data: null };
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
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
