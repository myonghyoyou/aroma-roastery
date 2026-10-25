import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // the store's Instagram photos, resized to the size they are shown at (signed URLs, so any query)
    remotePatterns: [{ protocol: "https", hostname: "**.cdninstagram.com" }],
  },
  experimental: {
    // keep Next.js's upgrade nudges to security advisories only
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
