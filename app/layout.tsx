import './globals.css';
import './_ui/components/layouts/App.scss';

import type { Metadata } from 'next';

import { moboBold, notoSansJp } from './_config/fonts';
import { AppLayoutContent } from './_ui/components/layouts/AppLayoutContent';

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
      <body className={`${notoSansJp.variable} ${moboBold.variable}`}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </body>
    </html>
  );
}
