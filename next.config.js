/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.hofker.org',
        pathname: '/homedocs-*/uploads/**',
      },
    ],
  },
  transpilePackages: ['libheif-js', 'heic-decode', 'heic-convert'],
};

module.exports = nextConfig;
