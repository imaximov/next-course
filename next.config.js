/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Any experimental features can be added here
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
  }
}

module.exports = nextConfig
