import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: [
    "@stacks/connect",
    "@stacks/network",
    "@stacks/transactions",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        vm: false,
      };
    }
    return config;
  },
};

export default nextConfig;
