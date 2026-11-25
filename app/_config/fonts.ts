import localFont from 'next/font/local';

// Noto Sans JP は layout.tsx で @fontsource/noto-sans-jp を読み込み、globals.css の --font-noto-sans-jp で参照する。

export const moboBold = localFont({
  src: '../_ui/assets/fonts/MOBO-Bold.otf',
  weight: '700',
  style: 'normal',
  variable: '--font-mobo-bold',
  display: 'swap',
});
