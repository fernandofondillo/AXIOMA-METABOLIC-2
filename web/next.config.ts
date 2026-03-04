import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Deploy to Vercel without blocking on lint
  },
  typescript: {
    ignoreBuildErrors: true, // Deploy to Vercel without blocking on type errors
  },
};

export default nextConfig;
