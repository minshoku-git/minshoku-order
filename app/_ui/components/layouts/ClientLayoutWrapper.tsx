'use client';

import { Box, createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Session } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';

import fvImage from '../../_images/fv.jpg';
import { AuthProvider } from '../../contexts/auth/AuthContext';
import { DirtyProvider } from '../../state/dirty/dirtyContext';
import { OpenProcessing } from '../../state/processing/processing';
import { ProcessingProvider } from '../../state/processing/processingContext';
import { OpenSnackBar } from '../../state/snackBar/snackBar';
import { SnackBarProvider } from '../../state/snackBar/snackbarContext';
import { SnackBarInitializer } from '../../state/snackBar/snackBarInitializer';
import { queryClientInstance } from '../../../_lib/hooks/query/queryClient';
import { Footer } from './Footer';
import Header from './Header';



// 既存のMUIテーマ定義をそのまま使用
const theme = createTheme({
    typography: {
        fontFamily: ['Noto Sans JP', 'Yu Gothic', '游ゴシック体', 'YuGothic', 'sans-serif'].join(','),
        allVariants: { color: '#252525' },
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #707070' },
                },
            },
        },
    },
});

// サーバーから初期セッションを受け取るためのProps定義
type ClientLayoutWrapperProps = {
    children: React.ReactNode;
    // サーバーから取得した初期セッション。AuthContextに渡します。
    initialSession: Session | null;
};

export function ClientLayoutWrapper({ children, initialSession }: ClientLayoutWrapperProps) {
    const pathname = usePathname(); // 👈 クライアントHookを使用
    const isLoginPage = pathname?.includes('/login');

    return (
        <AppRouterCacheProvider>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <DirtyProvider>
                    <SnackBarProvider>
                        <SnackBarInitializer />
                        <ProcessingProvider>
                            <QueryClientProvider client={queryClientInstance}>
                                {/* 取得した初期セッションをAuthProviderに注入する */}
                                <AuthProvider initialSession={initialSession}>
                                    <OpenSnackBar />
                                    <OpenProcessing />
                                    <Box
                                        sx={{
                                            background: '#efe9de',
                                            flexDirection: 'column',
                                            minHeight: '100vh',
                                            overflowX: 'hidden',
                                        }}
                                    >
                                        <Header />
                                        {isLoginPage && (
                                            <Box
                                                sx={{
                                                    height: '240px',
                                                    width: '100%',
                                                    display: 'block',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '@media screen and (max-width:420px)': {
                                                        height: '140px',
                                                    },
                                                }}
                                            >
                                                <Image
                                                    src={fvImage}
                                                    alt="背景画像"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        display: 'block',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                        <Box
                                            sx={{
                                                width: '90%',
                                                maxWidth: 640,
                                                pt: '20px',
                                                mx: 'auto',
                                                pb: 8,
                                            }}
                                        >
                                            {children}
                                        </Box>
                                        <Footer />
                                    </Box>
                                </AuthProvider>
                            </QueryClientProvider>
                        </ProcessingProvider>
                    </SnackBarProvider>
                </DirtyProvider>
            </MuiThemeProvider>
        </AppRouterCacheProvider>
    );
}