import { Session, User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { SessionResponse } from '@/app/_lib/getSession/types';
import { createClient } from '@/app/_lib/supabase/server';
import { ApiResponse } from '@/app/_types/types';

export async function POST(_req: NextRequest) {
  const supabase = await createClient(); // 1. getUser() で信頼できるユーザー情報を取得 (ネットワーク検証済み)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let constructedSession: Session | null = null;

  if (user) {
    // 2. getSession() を使わず、アクセストークンのみを静かに取得する
    //    getUser() の前に実行される内部ロジックを避けるため、
    //    セッション情報自体は getSession() の結果から取得するが、
    //    その結果の 'user' プロパティには依存しない。
    const {
      data: { session },
    } = await supabase.auth.getSession(); // ⚠️ 警告が出ても、ここではトークン取得のためだけに利用

    if (session) {
      // 3. 信頼できる user オブジェクトと、取得したトークン情報を使用して Session オブジェクトを組み立てる
      //    これにより、getSession() の 'user' プロパティは参照せず、警告の原因を排除できる。
      constructedSession = {
        access_token: session.access_token,
        token_type: session.token_type,
        user: user, // ⭐ ここに getUser() で取得した信頼できる user を入れる
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        refresh_token: session.refresh_token,
      } as Session; // Session 型としてキャスト
    }
  }

  const result: ApiResponse<SessionResponse> = { success: true, data: { session: constructedSession } };
  return NextResponse.json(result);
}
