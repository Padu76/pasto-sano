/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurazione immagini esterne
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['localhost'],
  },

  // Headers di sicurezza
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://pastosano.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
    ];
  },

  // Rewrites per API esterne
  async rewrites() {
    return [
      {
        source: '/api/stripe-webhook',
        destination: '/api/webhook',
      },
    ];
  },

  // Variabili d'ambiente da esporre al client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://pastosano.vercel.app',
  },

  // Ottimizzazioni
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Configurazione TypeScript
  typescript: {
    // Durante il build, continua anche se ci sono errori TypeScript
    ignoreBuildErrors: false,
  },

  // Configurazione ESLint
  eslint: {
    // Durante il build, continua anche se ci sono errori ESLint
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib'],
  },

  // Experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['firebase-admin'],
  },

  // Output
  output: 'standalone',
};

module.exports = nextConfig;