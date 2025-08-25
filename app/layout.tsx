import './globals.css';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from 'next';
import React from 'react';

import { DirtyProvider } from './_ui/dirty/dartyContext';
import { notoSansJp } from './_ui/fonts';
import ThemeProvider from './_ui/theme-provider';

/** @type {Metadata} metadata */
export const metadata: Metadata = {
  title: {
    default: 'みんなの社食',
    template: '%s | みんなの社食',
  },
  description: 'みんなの社食',
  icons: {
    icon: [
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }, // default fallback
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    title: 'みんしょく',
  },
  manifest: '/site.webmanifest',
};

/**
 * Layout
 * @param {React.ReactNode} children
 * @returns
 */
const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  /* jsx
  ---------------------------------------------------------------------------------------------------- */
  return (
    <html lang="ja">
      <body className={notoSansJp.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <DirtyProvider>{children}</DirtyProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
};
export default Layout;
