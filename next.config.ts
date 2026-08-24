import type { NextConfig } from "next";
import path from "node:path";
import { LEGACY_ALBUM_REDIRECTS, LEGACY_CATEGORY_REDIRECTS } from "./src/lib/legacy-routes";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/webp"],
    deviceSizes: [375, 640, 828, 1080, 1200, 1600],
    imageSizes: [96, 160, 256, 384],
  },
  async redirects() {
    return [
      ...LEGACY_CATEGORY_REDIRECTS.map((item) => ({
        source: `/portfolio/${item.from}`,
        destination: `/portfolio/${item.to}`,
        permanent: true,
      })),
      ...LEGACY_ALBUM_REDIRECTS.map((item) => ({
        source: `/portfolio/${item.category}/${item.album}`,
        destination: `/portfolio/${item.to}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
