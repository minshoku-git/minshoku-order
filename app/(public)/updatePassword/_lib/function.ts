import { createClient } from '@/app/_lib/supabase/server';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { PasswordResetRequest } from './types';

/**
 * パスワード変更
 * @returns {Promise<ApiResponse<string>>}
 */
export const updatePassword = async (values: ApiRequest<PasswordResetRequest>): Promise<ApiResponse<null>> => {
  const supabase = await createClient();
  const req = values.request;

  try {
    /* 新しいパスワードと新しいパスワード(再入力)の検証
  　------------------------------------------------------------------ */
    if (req.new_signup_password !== req.confirm_new_signup_password) {
      throw new CustomError(ErrorCodes.NOT_FOUND.code, '' + ErrorCodes.NOT_FOUND.message, ErrorCodes.NOT_FOUND.status);
    }

    /* パスワード更新
  　------------------------------------------------------------------ */
    const { error } = await supabase.auth.updateUser({
      email: req.email,
      password: req.new_signup_password,
    });

    if (error) {
      console.log(error);
      if (error.code === 'same_password') {
        throw new CustomError(ErrorCodes.PASSWORD_SAME_AS_OLD);
      }
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        'パスワードの更新' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);

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
  }
};
