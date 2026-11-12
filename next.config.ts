import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['canvas'],
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js'
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
      },
      {
        source: '/dashboard/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
