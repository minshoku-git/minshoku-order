import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { UserData } from './types';

/**
 * getLoginUserDetail
 * ログイン中のユーザーIDに基づき、全ての詳細なユーザー情報（会社、部署、勤務形態、各種設定を含む）を取得します。
 *
 * @param client Supabaseクライアントインスタンス
 * @returns {Promise<UserData>} ユーザーの詳細情報
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLoginUserDetail = async (client: SupabaseClient<any>): Promise<UserData> => {
  try {
    const {
      data: { user },
      error: errorUser,
    } = await client.auth.getUser();
    if (errorUser || !user || !user.email) {
      throw new CustomError(ErrorCodes.LOGGED_OUT);
    }

    /* メニュー情報取得
    ------------------------------------------------------------------ */
    const query = client
      .from('t_user')
      .select(
        `id,
      user_name,
      user_name_kana,
      user_registration_status,
      usage_status,
      user_email,
      payment_type,
      t_companies_id,
      t_companies_department_id,
      t_companies_employment_status_id,
      t_companies!inner(
        company_name,
        branch_name,
        restaurant_name,
        location,
        offer_time_from,
        offer_time_to,
        order_period_day,
        order_period_time,
        cancel_period_day,
        cancel_period_time,
        optional_item_title_1,
        optional_item_notes_1,
        optional_item_title_2,
        optional_item_notes_2
      ),
      t_companies_department!inner(
        department_name
      ),  
      t_companies_employment_status!inner(
        employment_status_name
      )`
      )
      .eq('user_email', user.email)
      .single();

    const { data, error } = (await query) as PostgrestSingleResponse<UserData>;
    if (error || !data) {
      console.error('query error', error);
      throw new CustomError(
        ErrorCodes.DB_QUERY_FAILED.code,
        'ユーザー情報の取得' + ErrorCodes.DB_QUERY_FAILED.message,
        ErrorCodes.DB_QUERY_FAILED.status
      );
    }
    /* 返却
    ------------------------------------------------------------------ */
    return data;
  } catch (e: unknown) {
    console.error(e);
    if (e instanceof CustomError) {
      throw e;
    }
    throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
  }
};
