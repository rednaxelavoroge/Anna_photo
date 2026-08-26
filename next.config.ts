import type { NextConfig } from "next";
import path from "node:path";
import { LEGACY_ALBUM_REDIRECTS, LEGACY_CATEGORY_REDIRECTS } from "./src/lib/legacy-routes";

const isExport = process.env.NAMECHEAP_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export" as const, trailingSlash: true } : {}),
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/api/admin/**/*": ["./src/data/**/*.json"],
  },
  images: isExport
    ? { unoptimized: true }
    : {
        formats: ["image/webp"],
        deviceSizes: [375, 640, 828, 1080, 1200, 1600],
        imageSizes: [96, 160, 256, 384],
      },
  ...(isExport
    ? {}
    : {
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
      }),
};

export default nextConfig;
