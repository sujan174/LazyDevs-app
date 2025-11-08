import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: true,

  // Enable production source maps for better debugging (optional)
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Bundle analyzer (uncomment to analyze bundle size)
  // To use: npm install @next/bundle-analyzer
  // Then uncomment the following lines and run: ANALYZE=true npm run build
  // ...process.env.ANALYZE === 'true' && require('@next/bundle-analyzer')(),
};

export default nextConfig;
