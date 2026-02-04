import { EmailOtpType } from '@supabase/supabase-js';

import { createClient } from '@/app/_lib/supabase/server';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { PasswordResetRequest, PasswordResetResponse } from './types';

/**
 * パスワード変更
 * @returns {Promise<ApiResponse<string>>}
 */
export const resetPassword = async (
  values: ApiRequest<PasswordResetRequest>
): Promise<ApiResponse<PasswordResetResponse>> => {
  const supabase = await createClient();
  const req = values.request;
  const token_hash = req.token;

  try {
    /* 新しいパスワードと新しいパスワード(再入力)の検証
  　------------------------------------------------------------------ */
    if (req.new_signup_password !== req.confirm_new_signup_password) {
      throw new CustomError(ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH);
    }

    /* AuthCheck
  　------------------------------------------------------------------ */
    console.log('token_hash', token_hash);

    const { error: errorVerifyOtp } = await supabase.auth.verifyOtp({
      type: 'recovery' as EmailOtpType,
      token_hash,
    });

    if (errorVerifyOtp) {
      console.error(errorVerifyOtp);
      return {
        success: true,
        data: { result: false, ErrorMessage: ErrorCodes.AUTH_CODE_EXPIRED.message },
      };
    }

    /* パスワード更新
  　------------------------------------------------------------------ */
    const { error } = await supabase.auth.updateUser({
      password: req.new_signup_password,
    });

    if (error) {
      console.error(error);
      if (error.code === 'same_password') {
        return {
          success: true,
          data: { result: false, ErrorMessage: ErrorCodes.PASSWORD_SAME_AS_OLD.message },
        };
      }
      return {
        success: true,
        data: { result: false, ErrorMessage: 'パスワードの再設定' + ErrorCodes.DB_QUERY_FAILED.message },
      };
    }

    /* ログアウト
  　------------------------------------------------------------------ */
    await supabase.auth.signOut();

    return { success: true, data: { result: true } };
  } catch (e: unknown) {
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Failed to sign out after updatePassword error:', signOutError);
      // サインアウト失敗はメインのエラーにはせず、ログに残す
    }
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
