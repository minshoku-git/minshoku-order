import React from 'react';

import { createClient as createServerClient } from '../../../_lib/supabase/server';
import { ClientLayoutWrapper } from './ClientLayoutWrapper';

export async function AppLayoutContent({ children }: { children: React.ReactNode }) {

    // 1. サーバー側で安全にセッションを取得
    // サーバークライアントの定義が引数なしに戻ったため、cookies()は内部で呼ばれます。
    // MEMO: cookies()のインポートは必要ですが、createClientには渡しません。
    const supabase = await createServerClient();

    // ユーザーセッションを取得
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // 2. 取得したセッション情報をクライアントラッパーに渡す
    return (
        <ClientLayoutWrapper initialSession={session}>
            {children}
        </ClientLayoutWrapper>
    );
}