import { PostgrestSingleResponse, Session } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { LoginUserQueryResponse } from '@/app/_lib/getLoginUser/types';
import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';
import { AuthContextResponse } from '@/app/_ui/contexts/auth/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

/**
 * POST /api/auth
 * 認証コンテキスト用の初期ユーザー情報とセッションを取得します。
 * SECURITY: supabase.auth.getUser() を使用してトークンを検証しています。
 */
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();

    // -----------------------------------------------------
    // 1. ユーザー情報の取得と検証 (getUser() を使用)
    // -----------------------------------------------------
    const {
      data: { user: verifiedUser },
      error: userError,
    } = await supabase.auth.getUser();

    // -----------------------------------------------------
    // 2. 非認証状態の早期リターン
    // -----------------------------------------------------
    if (!verifiedUser) {
      if (userError) {
        console.warn('Authentication check failed (no user):', userError.message);
      }
      const res: ApiResponse<AuthContextResponse> = {
        success: true,
        data: { session: null },
      };
      return NextResponse.json(res);
    }

    // -----------------------------------------------------
    // 3. ユーザーと会社情報のフェッチ
    // -----------------------------------------------------
    const query = supabase
      .from('t_user')
      .select(
        `user_name,
         user_registration_status,
         t_companies!inner(
          restaurant_name
        )`
      )
      .eq('user_email', verifiedUser.email)
      .single();

    const { error: userDataError, data: userData } = (await query) as PostgrestSingleResponse<LoginUserQueryResponse>;

    if (userDataError || !userData || !userData.t_companies) {
      console.error('t_user query failed. User exists but data is missing/invalid:', userDataError);
      const res: ApiResponse<AuthContextResponse> = {
        success: true,
        data: { session: null },
      };
      return NextResponse.json(res);
    }

    // -----------------------------------------------------
    // 4. セッションを取得し、成功応答を返却
    // -----------------------------------------------------
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res: ApiResponse<AuthContextResponse> = {
      success: true,
      data: {
        session: session as Session,
        userRegistrationStatus: userData.user_registration_status,
        restaurantName: userData.t_companies.restaurant_name,
        userName: userData.user_name,
      },
    };

    return NextResponse.json(res);
  } catch (e) {
    console.error('Internal server error in auth status API:', e);
    const res: ApiResponse<null> = {
      success: false,
      error: { code: ErrorCodes.INTERNAL_SERVER_ERROR.code, message: ErrorCodes.INTERNAL_SERVER_ERROR.message },
    };
    return NextResponse.json(res, { status: 500 });
  }
}
