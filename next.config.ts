import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.SUPABASE_NAME_DEV + '.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // セキュリティレスポンスヘッダの設定
  async headers() {
    const supabaseHostname = process.env.SUPABASE_NAME_DEV 
      ? `https://${process.env.SUPABASE_NAME_DEV}.supabase.co` 
      : 'https://*.supabase.co';

    return [
      {
        // 画面、APIを含むすべてのリクエストに適用
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // クリックジャッキング対策：他サイトのiframeへの埋め込みを禁止
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=()', // 不要なブラウザ機能を禁止
          },
          {
            // 監査の指摘通り、UI崩れや決済クラッシュを防ぐため、「Report-Only（警告のみ）」で本適用します
            key: 'Content-Security-Policy-Report-Only',
            value: 
              "default-src 'self'; " +
              // 画像：自身、dataスキーム、および設定されたSupabaseのドメインを許可
              `img-src 'self' data: ${supabaseHostname}; ` +
              // スクリプト：自身、Next.jsの内部インライン、およびGMO決済用JSのドメインを許可
              "script-src 'self' 'unsafe-inline' https://static.mul-pay.jp https://stg.static.mul-pay.jp; " +
              // スタイル：MUIのデザイン崩れを防ぐため 'unsafe-inline' を許可
              "style-src 'self' 'unsafe-inline'; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;