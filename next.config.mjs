/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: function (config, options) {
    const { isServer } = options;
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  env: {
    STABILITY_API_KEY: process.env.STABILITY_API_KEY,
    PINATA_JWT_TOKEN: process.env.PINATA_JWT_TOKEN,
  },
};

export default nextConfig;
