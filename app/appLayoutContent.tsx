'use client';

import { Box, createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import fvImage from './_ui/_images/fv.jpg';
import { Footer } from './_ui/_parts/_layout/Footer';
import Header from './_ui/_parts/_layout/Header';
import { DirtyProvider } from './_ui/dirty/dartyContext';
import { OpenProcessing } from './_ui/processing/processing';
import { ProcessingProvider } from './_ui/processing/processingContext';
import { OpenSnackBar } from './_ui/snackBar/snackBar';
import { SnackBarProvider } from './_ui/snackBar/snackbarContext';
import { SnackBarInitializer } from './_ui/snackBar/snackBarInitializer';
import { queryClientInstance } from './_ui/tanstackQuery/queryClient';

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

export function AppLayoutContent({ children }: { children: React.ReactNode }) {
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
                            </QueryClientProvider>
                        </ProcessingProvider>
                    </SnackBarProvider>
                </DirtyProvider>
            </MuiThemeProvider>
        </AppRouterCacheProvider>
    );
}
