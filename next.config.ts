import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: false },
  redirects: async () => [],
};

export default nextConfig;
