import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default nextConfig;
