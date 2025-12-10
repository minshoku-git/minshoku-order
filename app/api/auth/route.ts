import { PostgrestSingleResponse, Session } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { LoginUserQueryResponse } from '@/app/_lib/getLoginUser/types';
import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';
import { AuthContextResponse } from '@/app/_ui/contexts/auth/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

/**
 * POST /api/auth
 * 認証コンテキスト用の初期ユーザー情報を取得します。
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
      const result: ApiResponse<AuthContextResponse> = {
        success: true,
        data: { email: null },
      };
      return NextResponse.json(result);
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
      const result: ApiResponse<AuthContextResponse> = {
        success: true,
        data: { email: null },
      };
      return NextResponse.json(result);
    }

    // -----------------------------------------------------
    // 4. 成功応答を返却
    // -----------------------------------------------------
    const result: ApiResponse<AuthContextResponse> = {
      success: true,
      data: {
        email: verifiedUser.email ?? '',
        userRegistrationStatus: userData.user_registration_status,
        restaurantName: userData.t_companies.restaurant_name,
        userName: userData.user_name,
      },
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error('Internal server error in auth status API:', e);
    const result: ApiResponse<null> = {
      success: false,
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
    return NextResponse.json(result.error, { status: result.error.status });
  }
}
