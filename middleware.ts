import { type NextRequest } from 'next/server';

import { updateSession } from './app/_lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = {
  // 認証時、閲覧可能なページ
  matcher: [
    '/order',
    '/order-history',
    '/edit-payment',
    '/edit-profile',
    '/register-payment', // MEMO: updateSessionでチェック済み(含めると無限リダイレクト発生します)
    '/contact',
    // ログインページにもミドルウェアを適用するため、'/login' を追加
    '/login',
    '/login/:id*',
    '/',
  ],
};
