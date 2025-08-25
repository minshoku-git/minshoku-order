import { createClient } from '@/app/_lib/supabase/server';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { GetAuthResponse, PasswordResetRequest } from './types';

/**
 * ユーザー情報取得
 * @returns {Promise<ApiResponse<GetAuthResponse>>}
 */
export const getAuth = async (values: ApiRequest<null>): Promise<ApiResponse<GetAuthResponse>> => {
  const supabase = await createClient();

  try {
    /* Auth取得
  　------------------------------------------------------------------ */
    const { error, data } = await supabase.auth.getUser();

    if (error) {
      throw new CustomError(ErrorCodes.NOT_FOUND);
    }

    return { success: true, data: { id: data.user.id ?? '', email: data.user.email ?? '' } };
    // return { success: true, data: { id: data.session?.user.id ?? '', email: data.session?.user.email ?? '' } };
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
