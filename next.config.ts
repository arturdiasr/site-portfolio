import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['sanity', '@sanity/ui', 'framer-motion', 'motion'],
};

export default nextConfig;
