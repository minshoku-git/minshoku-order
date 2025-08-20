import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserLoginFormValues } from './types';

/* ユーザーログイン
------------------------------------------------------------------ */
/**
 * ログイン
 * @param {ApiRequest<UserLoginFormValues>} req
 * @returns {Promise<ApiResponse<string>>}
 */
export const login = async (req: ApiRequest<UserLoginFormValues>): Promise<ApiResponse<string>> => {
  const supabase = await createClient();
  const { email, password } = req.request;

  console.log('email:', email);
  console.log('password:', password);

  try {
    // 1.ユーザー情報取得
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
    if (
      data.usage_status === UsageStatus.DEACTIVATION &&
      data.user_registration_status === UserRegistrationStatus.REGISTERED
    ) {
      // 登録ステータスが利用可能 && 利用ステータスが利用停止の場合
      throw new CustomError(ErrorCodes.ACCOUNT_SUSPENDED);
    }

    // 2.サインイン
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Error signing in:', signInError);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'ログイン' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    return { success: true, data: '' };
  } catch (e: unknown) {
    console.error(e);
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
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
  }
};
