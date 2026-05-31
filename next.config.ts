import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lint is run separately in CI; don't fail production builds on lint.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Optional deps pulled in by wagmi/walletconnect that aren't used in a
    // browser build — stub them so webpack doesn't warn / fail to resolve.
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };
    return config;
  },
};

export default nextConfig;
