/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for workspace root detection warning
  outputFileTracingRoot: __dirname,
  
  // Optimize for production
  poweredByHeader: false,
  
  // Enable experimental features if needed
  experimental: {
    // typedRoutes: true,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'kids-storytelling-bot',
  },
}

module.exports = nextConfig
