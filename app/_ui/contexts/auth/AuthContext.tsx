import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest, ApiResponse } from '@/app/_types/types';

import { useApiQuery } from '../../../_lib/hooks/query/useApiQuery';
import { sessionStatusfetcher } from './fetcher';
import { AuthContextResponse } from './types';

// AuthContextTypeの定義はそのまま維持
type AuthContextType = {
    userId: string | null;
    // session: Session | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoggingOut: boolean;
    restaurantName?: string;
    userRegistrationStatus: string;
    userName?: string;
};

type AuthProviderProps = {
    children: ReactNode;
    userEmail: string | null;
};

// Contextの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Providerコンポーネント
export function AuthProvider({ children, userEmail }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // サーバー注入データを初期値に使用し、初期化は完了済みとする
    const [userId, setUserId] = useState<string | null>(userEmail ?? null);
    // const [session, setSession] = useState<Session | null>(initialSession);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const req: ApiRequest<null> = { request: null };

    // Tanstack Queryでのセッション状態のポーリング
    const { data: queryData, isLoading: isQueryLoading, isFetched } = useApiQuery<AuthContextResponse>({
        queryKey: [QUERY_KEYS.AUTH_STATUS],
        queryFn: () => sessionStatusfetcher(req),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (queryData) {
            const newUser = queryData.email ?? null;

            console.log("New user:", newUser);

            // 状態が変化した場合のみ更新（不要な再レンダリングを防ぐ）
            if (newUser) {
                setUserId(newUser);
            }
        }
    }, [queryData, setUserId]);

    useEffect(() => {
        setIsAuthenticated(!!userId); // userがnullでない場合にtrue
    }, [userId]);

    // ログアウト関数 (ロジックは変更なし)
    const logout = async () => {
        setIsLoggingOut(true); // ★ログアウト開始時にtrueに設定

        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            const res = await response.json() as ApiResponse<null>;

            if (res.success) {
                queryClient.clear();
                queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTH_STATUS] });

                setUserId(null);

                // サーバーインジェクションがない場合は /login にリダイレクト
                router.push('/login');
            } else {
                console.error("Server API logout failed:", res.error);
            }
        } catch (e) {
            console.error("Network error during logout:", e);
            queryClient.clear();
            router.push('/login');
        } finally {
            // ログアウト処理の終了時にfalseに戻す（リダイレクト後でも可）
            setIsLoggingOut(false); // ★終了時にfalseに戻す
        }
    };


    // 最終的なユーザー
    const finalUser = userId;
    const apiData = queryData ?? null;

    // 認証情報が確定したユーザー名、レストラン名を取得
    const finalRestaurantName = apiData?.restaurantName;
    const finalUserName = apiData?.userName;
    const finalUserRegistrationStatus = apiData?.userRegistrationStatus;

    // 最終的なローディング状態の決定
    const finalIsLoading = !isFetched && isQueryLoading;

    return (
        <AuthContext.Provider
            value={{
                userId: finalUser,
                isLoading: finalIsLoading,
                isAuthenticated: isAuthenticated,  // 更新したisAuthenticatedを反映
                isLoggingOut: isLoggingOut,
                logout,
                userRegistrationStatus: finalUserRegistrationStatus ?? '',
                restaurantName: finalRestaurantName ?? '',
                userName: finalUserName,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// カスタムフック
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
