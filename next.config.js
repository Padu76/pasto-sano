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

  // Rewrites - Rimuovo il rewrite problematico
  async rewrites() {
    return [];
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

  // Experimental features - Aggiungo i pacchetti Firebase
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/storage',
      'firebase'
    ],
  },

  // Output
  output: 'standalone',

  // WEBPACK CONFIGURATION - FIX per undici/Firebase
  webpack: (config, { isServer }) => {
    // Fix per il problema di undici con sintassi private fields
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-proposal-private-property-in-object'
          ]
        }
      }
    });

    // Alternativa: escludi completamente undici dal bundle client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'undici': false,
        'undici/lib/web/fetch/util': false,
        'undici/lib/web/fetch/headers': false,
      };
    }

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
    };

    // Ignora warnings per moduli opzionali
    config.ignoreWarnings = [
      { module: /node_modules\/undici/ },
      { module: /node_modules\/@firebase/ },
      { module: /node_modules\/firebase/ },
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

  // Transpile packages - Aggiungo i moduli da transpilare
  transpilePackages: [
    'firebase',
    '@firebase/app',
    '@firebase/auth',  
    '@firebase/firestore',
    '@firebase/storage',
    '@firebase/functions',
    '@firebase/database',
    '@firebase/analytics',
    '@firebase/performance',
    '@firebase/remote-config',
    '@firebase/messaging',
    '@firebase/util',
    '@firebase/component',
    'emailjs-com',
    '@emailjs/browser'
  ],
}

module.exports = nextConfig;