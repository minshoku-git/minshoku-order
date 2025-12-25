import { createClient } from '@/app/_lib/supabase/server';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { EditPasswordFormValues } from './types';

/**
 * パスワード変更
 * @returns {Promise<ApiResponse<string>>}
 */
export const updatePassword = async (values: ApiRequest<EditPasswordFormValues>): Promise<ApiResponse<null>> => {
  const client = await createClient();
  const req = values.request;

  try {
    /* AuthCheck
  　------------------------------------------------------------------ */
    const currentUser = await client.auth.getUser();
    const email = currentUser.data.user?.email ?? '';

    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password: req.current_password,
    });

    if (signInError) {
      throw new CustomError(ErrorCodes.CURRENT_PASSWORD_INCORRECT);
    }

    /* 新しいパスワードと新しいパスワード(再入力)の検証
  　------------------------------------------------------------------ */
    /* 新しいパスワードと新しいパスワード(再入力)の検証 */
    if (req.new_signup_password !== req.confirm_new_signup_password) {
      throw new CustomError(ErrorCodes.PASSWORD_CONFIRMATION_MISMATCH);
    }

    /* 新旧パスワードが同じでないかを事前チェック */
    if (req.current_password === req.new_signup_password) {
      throw new CustomError(ErrorCodes.PASSWORD_SAME_AS_OLD);
    }

    /* パスワード更新
  　------------------------------------------------------------------ */
    const { error } = await client.auth.updateUser({
      password: req.new_signup_password,
    });

    if (error) {
      console.log(error);
      if (error.code === 'same_password') {
        throw new CustomError(ErrorCodes.PASSWORD_SAME_AS_OLD);
      }
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'パスワードの更新' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return { success: true, data: null };
  } catch (e: unknown) {
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
