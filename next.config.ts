import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev sunucusunu telefondan LAN IP'siyle açmak için (yalnızca `pnpm dev`; IP değişirse güncelle).
  allowedDevOrigins: ["10.0.100.104"],
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
