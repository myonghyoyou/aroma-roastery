import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Instagram photos come through /ig/<id> (a fixed address per photo), so each size is made once
    // and kept for a month instead of the default 4 hours
    minimumCacheTTL: 2678400,
    // the photos are at most 1440px wide: no sizes above that, so fewer copies to make per photo
    deviceSizes: [640, 828, 1080, 1440],
    imageSizes: [256, 384],
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
