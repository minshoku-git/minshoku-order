import React from 'react';

import { createClient as createServerClient } from '../../../_lib/supabase/server';
import { ClientLayoutWrapper } from './ClientLayoutWrapper';

export async function AppLayoutContent({ children }: { children: React.ReactNode }) {

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <ClientLayoutWrapper initialUserEmail={user?.email ?? null}>
            {children}
        </ClientLayoutWrapper>
    );
}