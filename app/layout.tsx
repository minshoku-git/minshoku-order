import './globals.css';
import './_ui/_parts/_layout/App.scss';

import type { Metadata } from 'next';

import { notoSansJp } from './_ui/fonts';
import { AppLayoutContent } from './appLayoutContent';

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
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    title: 'みんしょく',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={notoSansJp.variable}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </body>
    </html>
  );
}
