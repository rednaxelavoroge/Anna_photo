import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/blog/**": ["./content/blog/**"],
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [375, 640, 828, 1080, 1200, 1600],
    imageSizes: [96, 160, 256, 384],
  },
  async redirects() {
    return [
      { source: "/obo-mne", destination: "/about", permanent: true },
      { source: "/kontakty", destination: "/contacts", permanent: true },
      { source: "/statii", destination: "/blog", permanent: true },
      { source: "/statii/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/guides", destination: "/blog", permanent: true },
      { source: "/guides/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
