import React from 'react';

import { createClient as createServerClient } from '../../../_lib/supabase/server';
import { ClientLayoutWrapper } from './ClientLayoutWrapper';

export async function AppLayoutContent({ children }: { children: React.ReactNode }) {

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let initialData = {
        email: user?.email ?? null,
        userRegistrationStatus: '',
        restaurantName: '',
        userName: ''
    };

    // 2. ログイン済みならDBから詳細情報を先行取得
    if (user) {
        const { data: userData } = await supabase
            .from('t_user')
            .select(`
                user_registration_status,
                user_name,
                t_companies (
                    restaurant_name
                )
            `)
            .eq('id', user.id) // もしくは user_email
            .single();

        if (userData) {
            initialData = {
                ...initialData,
                userRegistrationStatus: userData.user_registration_status,
                userName: userData.user_name,
                restaurantName: (userData.t_companies as any)?.restaurant_name ?? ''
            };
        }
    }

    return (
        <ClientLayoutWrapper 
            initialUserEmail={initialData.email}
            initialStatus={initialData.userRegistrationStatus}
            initialRestaurant={initialData.restaurantName}
            initialUserName={initialData.userName}
        >
            {children}
        </ClientLayoutWrapper>
    );
}