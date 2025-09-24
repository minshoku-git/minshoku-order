import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { UserRegistrationStatus } from '@/app/_types/enum';

export async function updateSession(request: NextRequest) {
  // 最初のレスポンスオブジェクトを作成
  const supabaseResponse = NextResponse.next({
    request,
  });

  // Supabaseクライアントを作成
  const supabase = createServerClient(process.env.SUPABASE_URL_DEV!, process.env.SUPABASE_ANON_DEV!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (options) {
            supabaseResponse.cookies.set(name, value, options);
          } else {
            supabaseResponse.cookies.set(name, value);
          }
        });
      },
    },
  });

  // ユーザー情報とセッション情報を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  const publicPaths = ['/', '/login', '/error', '/register-payment'];
  const isProtectedPath = !publicPaths.some((path) => currentPath === path);

  // 認証済みユーザーが公開パスにアクセスした場合、/orderにリダイレクト
  if (session && (currentPath === '/' || currentPath === '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/order';
    return NextResponse.redirect(url);
  }

  // 認証チェック
  // セッションが存在しない、かつ保護されたパスにアクセスしている場合のみ/loginにリダイレクト
  if (!session && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (!session && currentPath === '/register-payment') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // セッションありの場合に t_user を確認
  if (session && user) {
    const userEmail = user.email;

    const { data: userData, error } = await supabase
      .from('t_user')
      .select(
        `user_name,
        user_registration_status,
        t_companies!inner(
          restaurant_name
      )`
      )
      .eq('user_email', userEmail)
      .single();

    if (error || !userData) {
      console.error('Failed to fetch user from t_user:', error);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // 支払方法登録待ちの場合、/register-payment に遷移
    if (
      currentPath !== '/register-payment' &&
      userData.user_registration_status === UserRegistrationStatus.WAITING_PAYMENT_SETUP
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/register-payment';
      return NextResponse.redirect(url);
    }
    // 支払方法登録済みなのに /register-payment にアクセスしている場合、/order に遷移
    if (
      currentPath === '/register-payment' &&
      userData.user_registration_status !== UserRegistrationStatus.WAITING_PAYMENT_SETUP
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/order';
      return NextResponse.redirect(url);
    }
  }

  // クッキーの更新を含むレスポンスを返す
  return supabaseResponse;
}
