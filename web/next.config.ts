import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['10.47.126.79', 'localhost:3000'],
  },
};

export default nextConfig;
