/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Desabilita avisos de lint ou typescript no build caso precise pular validação
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/pt/post/:slug*',
        destination: '/post/:slug*',
        permanent: true,
      },
      {
        source: '/pt/posts/:slug*',
        destination: '/post/:slug*',
        permanent: true,
      },
      {
        source: '/posts/:slug*',
        destination: '/post/:slug*',
        permanent: true,
      },
      {
        source: '/en/posts/:slug*',
        destination: '/en/post/:slug*',
        permanent: true,
      },
      {
        source: '/es/posts/:slug*',
        destination: '/es/post/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
