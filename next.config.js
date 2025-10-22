/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable HTTPS for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
