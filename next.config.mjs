/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'your-satellite-data-api.com'],
  },
  // Disable experimental CSS optimization that causes critters module error
  experimental: {
    // optimizeCss: true,
  },
};

export default pwaConfig(nextConfig);

