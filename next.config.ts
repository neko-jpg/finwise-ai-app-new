
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/ja',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ja/:path*',
        destination: '/:path*',
        permanent: true,
      },
       {
        source: '/app',
        destination: '/',
        permanent: false, // Should only happen if user is not logged in
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/marketing',
        destination: '/(marketing)',
      },
      {
        source: '/marketing/:path*',
        destination: '/(marketing)/:path*',
      },
    ]
  },
  // This is to allow the Next.js dev server to be proxied in the Studio IDE
  allowedDevOrigins: ["*.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev"],
};

export default nextConfig;
