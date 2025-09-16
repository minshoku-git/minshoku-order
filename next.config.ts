import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname:  process.env.SUPABASE_NAME_DEV+ '.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
};

export default nextConfig;