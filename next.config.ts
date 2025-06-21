import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improve hydration stability
  reactStrictMode: true,
  
  // Handle browser extension interference
  experimental: {
    // This helps with hydration mismatches
    optimizePackageImports: ['@mastra/core', '@mastra/memory'],
  },
  
  // Add headers to help with browser extension issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
