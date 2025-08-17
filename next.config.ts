import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: false },
  redirects: async () => [],
  webpack: (config) => {
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /@opentelemetry\/winston-transport/,
      })
    );
    return config;
  },
};

export default nextConfig;
