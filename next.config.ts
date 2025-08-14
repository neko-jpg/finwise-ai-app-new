
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is to allow the Next.js dev server to be proxied in the Studio IDE
    allowedDevOrigins: ["*.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev"],
  },
};

export default nextConfig;
