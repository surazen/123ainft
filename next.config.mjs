/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Add this line for static exports
  webpack: function (config, options) {
    const { isServer } = options;
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    // Improve WebAssembly loading
    config.output.webassemblyModuleFilename = isServer
      ? './../static/wasm/[modulehash].wasm'
      : 'static/wasm/[modulehash].wasm';
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
  // Enable build cache
  experimental: {
    swcMinify: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
