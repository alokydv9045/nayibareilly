import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized output for Vercel deployment (disabled for local serving)
  // output: 'standalone',
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment variables (Vercel will inject these)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // TypeScript - strict for production
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
  
  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/department/water',
        destination: '/department',
        permanent: true,
      },
      {
        source: '/department/health-environment',
        destination: '/department',
        permanent: true,
      },
      {
        source: '/department/infrastructure',
        destination: '/department',
        permanent: true,
      },
      {
        source: '/app/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/app/my-issues',
        destination: '/my-issues',
        permanent: true,
      },
      {
        source: '/app/profile',
        destination: '/profile',
        permanent: true,
      },
      {
        source: '/app/notifications',
        destination: '/notifications',
        permanent: true,
      },
      {
        source: '/app/map',
        destination: '/map',
        permanent: true,
      },
      {
        source: '/app/report',
        destination: '/report',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  
  // Experimental features (stable in Next.js 15)
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
