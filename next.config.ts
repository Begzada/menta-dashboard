import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/management',
  assetPrefix: '/management',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
