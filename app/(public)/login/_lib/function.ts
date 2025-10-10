import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { t_user } from '@/app/_lib/supabase/tableTypes';
import { UsageStatus, UserRegistrationStatus } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { LoginUserQueryResponse, UserLoginFormValues } from './types';

/* ユーザーログイン
------------------------------------------------------------------ */
/**
 * ログイン
 * @param {ApiRequest<UserLoginFormValues>} req
 * @returns {Promise<ApiResponse<string>>}
 */
export const login = async (req: ApiRequest<UserLoginFormValues>): Promise<ApiResponse<null>> => {
  const supabase = await createClient();
  const { email, password } = req.request;

  console.log('email:', email);
  console.log('password:', password);

  try {
    // 1.ユーザー情報取得
    const query = supabase
      .from('t_user')
      .select(
        `
        usage_status,
        user_registration_status,
        t_companies!inner(
        usage_status
        )`
      )
      .eq('user_email', email)
      .maybeSingle();
    const { data, error } = (await query) as PostgrestSingleResponse<LoginUserQueryResponse>;

    // 予期しないエラー
    if (error) {
      console.error('Error signing in:', error);
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
    }
    // メールアドレスが未登録の場合
    if (!data) {
      console.error('Error signing in:', error);
      throw new CustomError(ErrorCodes.EMAIL_NOT_REGISTERED);
    }
    // 会社利用ステータスが利用不可の場合
    if (data.t_companies?.usage_status === UsageStatus.DEACTIVATION) {
      throw new CustomError(ErrorCodes.COMPANY_SUSPENDED);
    }
    // 登録ステータスが利用可能 && 利用ステータスが利用停止の場合
    if (
      data.usage_status === UsageStatus.DEACTIVATION &&
      data.user_registration_status === UserRegistrationStatus.REGISTERED
    ) {
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
    return { success: true, data: null };
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
