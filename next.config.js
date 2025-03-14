/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Any experimental features can be added here
    serverActions: {
      bodySizeLimit: '16mb' // Increase the body size limit for server actions
    }
  },
  
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Add HEIC/HEIF support for file uploads
  webpack(config) {
    config.module.rules.push({
      test: /\.(heic|heif)$/i,
      type: 'asset/resource',
    });
    
    return config;
  }
}

module.exports = nextConfig
