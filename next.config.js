/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["crypto-js"],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
