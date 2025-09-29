'use client';
import '../../app/_ui/_parts/_layout/App.scss';

import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { Footer } from '../_ui/_parts/_layout/Footer';
import Header from '../_ui/_parts/_layout/Header';
import { OpenProcessing } from '../_ui/processing/processing';
import { ProcessingProvider } from '../_ui/processing/processingContext';
import { OpenSnackBar } from '../_ui/snackBar/snackBar';
import { SnackBarProvider } from '../_ui/snackBar/snackbarContext';
import { SnackBarInitializer } from '../_ui/snackBar/snackBarInitializer';
import { queryClientInstance } from '../_ui/tanstackQuery/queryClient';

const client = queryClientInstance;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* Theme
  ------------------------------------------------------------------ */
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

  /* JSX
    ------------------------------------------------------------------ */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackBarProvider>
        <SnackBarInitializer />
        <ProcessingProvider>
          <QueryClientProvider client={client}>
            {/* snackバー表示 */}
            <OpenSnackBar />
            {/* 読込中表示 */}
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
    </ThemeProvider>
  );
}
