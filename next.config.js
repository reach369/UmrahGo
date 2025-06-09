const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Explicitly keep API routes outside of localization
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  images: {
    domains: ['umrahgo.reach369.com', 'localhost','umrahgo.net','admin.umrahgo.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  
  // Optimize for Vercel
  output: 'standalone',
};

const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);