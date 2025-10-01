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
            value: 'Content-Type, Authorization, stripe-signature',
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
    ignoreBuildErrors: false,
  },

  // Configurazione ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib'],
  },

  // Output
  output: 'standalone',

  // WEBPACK CONFIGURATION - FIX COMPLETO PER UNDICI
  webpack: (config, { isServer, webpack }) => {
    // IMPORTANTE: Escludi undici dal parsing per evitare problemi con private fields
    config.module.rules.push({
      test: /node_modules\/undici/,
      use: 'null-loader'
    });

    // Per client-side, sostituisci undici con una versione polyfill
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'undici': false,
        'undici/lib/web/fetch/util': false,
        'undici/lib/web/fetch/headers': false,
        'undici/lib/fetch': false,
        'undici/lib/client': false,
        'undici/lib/pool': false,
        'undici/lib/agent': false,
        'undici/lib/mock': false,
        'undici/lib/fetch': false,
        'undici/lib/global': false,
        'undici/lib/handler': false,
      };
      
      // Ignora completamente undici nel client bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^undici$/,
        })
      );

      // Fallback per moduli Node.js nel browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        events: false,
        buffer: false,
        process: false,
        querystring: false,
        'stream/web': false,
        'node:stream/web': false,
        'node:buffer': false,
        'node:util': false,
        'node:url': false,
        'node:net': false,
        'node:http': false,
        'node:https': false,
      };
    }

    // Ignora warnings per moduli opzionali
    config.ignoreWarnings = [
      { module: /node_modules\/undici/ },
      { module: /node_modules\/@firebase/ },
      { module: /node_modules\/firebase/ },
      /Failed to parse source map/,
      /Cannot find module/,
    ];

    // Ottimizzazione per Firebase
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            firebase: {
              name: 'firebase',
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin'
    ],
  },

  // Transpile packages - Solo EmailJS
  transpilePackages: [
    'emailjs-com',
    '@emailjs/browser'
  ],
}

module.exports = nextConfig;