import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cryptopulse/db", "@cryptopulse/shared"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  webpack(config) {
    const ignored = [
      "**/System Volume Information/**",
      "**/$RECYCLE.BIN/**",
      "**/pagefile.sys",
      "**/hiberfil.sys",
      "**/swapfile.sys"
    ];
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: Array.isArray(config.watchOptions?.ignored)
        ? [...config.watchOptions.ignored, ...ignored]
        : ignored
    };
    return config;
  }
};

export default nextConfig;

