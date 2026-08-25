import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
