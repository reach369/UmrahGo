const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
);
const path = require('path');

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
  
  // Move serverComponentsExternalPackages out of experimental (fixed)
  serverExternalPackages: ['axios'],
  images: {
    domains: ['admin.umrahgo.net', 'cdn.umrahgo.net', 'umrahgo.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.umrahgo.net',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.umrahgo.net',
        port: '',
        pathname: '/public/**',
      },
      {
        protocol: 'https',
        hostname: 'umrahgo.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.umrahgo.net',  
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  
  
  // Enable API route handling
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Handle static file serving
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/profile_photos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
  
  // Optimize for Vercel
  output: 'standalone',
  
  // Configure webpack to resolve aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src')
    };
    
    return config;
  },
  
  // Transpile framer-motion for better compatibility
  transpilePackages: ['framer-motion'],
};

module.exports = withNextIntl(nextConfig);