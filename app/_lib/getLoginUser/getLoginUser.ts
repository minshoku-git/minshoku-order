import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { ApiResponse } from '../../_types/types';
import { createClient } from '../supabase/server';
import { LoginUserQueryResponse, LoginUserResponse } from './types';

/**
 * getLoginUser
 * ログイン中のユーザー名、食堂名、登録ステータスなどの簡易情報を取得します。
 *
 * @returns {Promise<ApiResponse<LoginUserResponse>>} ユーザー簡易情報を含むAPIレスポンス
 */
export const getLoginUser = async (): Promise<ApiResponse<LoginUserResponse>> => {
  const client = await createClient();

  try {
    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const {
      data: { user },
      error: errorUser,
    } = await client.auth.getUser();
    if (errorUser) {
      throw new CustomError(ErrorCodes.LOGGED_OUT);
    }
    if (!user) {
      return { success: true, data: {} };
    }

    /* ユーザー名、食堂名、登録ステータス取得
    ------------------------------------------------------------------ */
    const query = client
      .from('t_user')
      .select(
        `id,
        user_name,
        user_registration_status,
        t_companies!inner(
          restaurant_name
      )`
      )
      .eq('user_email', user.email)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<LoginUserQueryResponse>;
    if (error || !data) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }

    return {
      success: true,
      data: {
        userName: data.user_name,
        restaurantName: data.t_companies.restaurant_name,
        userRegistrationStatus: data.user_registration_status,
      },
    };
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
