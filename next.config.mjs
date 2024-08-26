/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: function (config, options) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.blockfrost.io/:path*",
      },
    ];
  },
  env: {
    STABILITY_API_KEY: process.env.STABILITY_API_KEY,
  },
};

export default nextConfig;
