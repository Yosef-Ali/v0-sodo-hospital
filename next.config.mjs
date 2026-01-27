/** @type {import('next').NextConfig} */
// Force restart: 2026-01-27T23:55:00
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
