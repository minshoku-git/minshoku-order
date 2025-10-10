'use client';

import { Box, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';

import theme from '../../../_config/theme/theme'
import { queryClientInstance } from '../../../_lib/hooks/query/queryClient';
import fvImage from '../../assets/images/fv.jpg';
import { AuthProvider } from '../../contexts/auth/AuthContext';
import { DirtyProvider } from '../../state/dirty/dirtyContext';
import { OpenProcessing } from '../../state/processing/processing';
import { ProcessingProvider } from '../../state/processing/processingContext';
import { OpenSnackBar } from '../../state/snackBar/snackBar';
import { SnackBarProvider } from '../../state/snackBar/snackbarContext';
import { SnackBarInitializer } from '../../state/snackBar/snackBarInitializer';
import { Footer } from './Footer';
import Header from './Header';

// サーバーから初期セッションを受け取るためのProps定義を initialUserEmail に戻す
type ClientLayoutWrapperProps = {
    children: React.ReactNode;
    // サーバーから取得した初期ユーザーメールアドレス
    initialUserEmail: string | null;
};

export function ClientLayoutWrapper({ children, initialUserEmail }: ClientLayoutWrapperProps) {
    const pathname = usePathname();
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
                                {/* 取得した初期メールアドレスをAuthProviderに注入する */}
                                <AuthProvider userEmail={initialUserEmail}>
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
                                                pb: 4,
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