// Noto Sans JP / Roboto はパッケージ同梱のフォントファイルを使う（next/font/google はビルドのたびに
// Google から取得するため、取得の一時エラーでビルドが失敗していた）。
// - Noto Sans JP: globals.css の --font-noto-sans-jp で参照
// - Roboto: MUI の標準フォント（font-family: Roboto, Helvetica, Arial）として、テーマ外の部品（ログイン画面など）で使われる
import '@fontsource/noto-sans-jp/300.css';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './globals.css';
import './_ui/components/layouts/App.scss';

import type { Metadata } from 'next';

import { moboBold } from './_config/fonts';
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

  // 検索エンジンにインデックスさせない設定（noindex, nofollow）
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={moboBold.variable}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </body>
    </html>
  );
}
