/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/rocketwords' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rocketwords/' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
