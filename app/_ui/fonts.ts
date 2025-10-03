import { Noto_Sans_JP, Roboto } from 'next/font/google';
import localFont from 'next/font/local';

/** Noto_Sans_JP */
export const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  preload: false,
  variable: '--font-noto-sans-jp',
  display: 'swap',
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
});

/** Roboto */
export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  preload: false,
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
});

export const moboBold = localFont({
  src: './_fonts/MOBO-Bold.otf',
  weight: '700',
  style: 'normal',
  variable: '--font-mobo-bold',
  display: 'swap',
});
