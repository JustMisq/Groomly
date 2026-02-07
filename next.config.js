/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  headers: async () => {
    // ✅ SÉCURITÉ: CORS limité au domaine spécifique
    const allowedOrigins = (process.env.NEXTAUTH_URL || 'http://localhost:3000').split(',').map(url => url.trim())
    
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            // En dev: autoriser localhost, en prod: strictement le domaine
            value: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : (process.env.NEXTAUTH_URL || 'http://localhost:3000'),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          // ✅ SÉCURITÉ: Headers supplémentaires
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

// Wrap with Sentry for error tracking - only if DSN is configured
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
      org: process.env.SENTRY_ORG || 'groomly',
      project: process.env.SENTRY_PROJECT || 'groomly',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: process.env.NODE_ENV === 'development',
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      hideSourceMaps: true,
    })
  : nextConfig
