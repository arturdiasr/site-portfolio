import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['sanity', '@sanity/ui', 'framer-motion', 'motion'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
