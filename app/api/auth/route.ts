import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';
import { AuthContextResponse, UserAndCompanies } from '@/app/_ui/contexts/auth/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient(); // createClient() が引数なしの同期関数であることを前提

    // -----------------------------------------------------
    // 1. セッションとユーザー情報の取得
    // -----------------------------------------------------
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // セッション取得時のエラーは、サーバーの問題として扱う
    if (sessionError && sessionError.name !== 'AuthSessionMissingError') {
      console.error('Session acquisition error:', sessionError);
      throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    // -----------------------------------------------------
    // 2. 非認証状態の早期リターン
    // -----------------------------------------------------
    // セッションがない場合（ログアウト状態）、即座に null を返します
    if (!session) {
      const res: ApiResponse<AuthContextResponse> = {
        success: true,
        data: {
          session: null,
        },
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
      .eq('user_email', session.user.email)
      .single();

    const { error: userDataError, data: userData } = (await query) as PostgrestSingleResponse<UserAndCompanies>;

    if (userDataError || !userData || !userData.t_companies) {
      console.error(userDataError);
      // データを null として返し、クライアント側でログアウトさせる
      const res: ApiResponse<AuthContextResponse> = {
        success: true, // APIコール自体は成功
        data: {
          session: null, // セッションを null として返し、クライアントにログアウトを促す
        },
      };
      return NextResponse.json(res);
    }

    // -----------------------------------------------------
    // 4. 成功応答
    // -----------------------------------------------------
    const res: ApiResponse<AuthContextResponse> = {
      success: true,
      data: {
        session: session,
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
