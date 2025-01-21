/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.hofker.org',
        pathname: '/homedocs-*/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.github.com',
      },
    ],
  },
  transpilePackages: ['libheif-js', 'heic-decode', 'heic-convert'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com;
              img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://s3.hofker.org;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://*.github.com;
            `
              .replace(/\s+/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
