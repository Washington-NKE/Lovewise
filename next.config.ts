import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typeScript: {
    ignoreBuildErrors: true,
    
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
