import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root — otherwise Next walks up to $HOME and warns about
  // unrelated lockfiles it finds there.
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      // 阿里云 OSS / Aliyun OSS
      { protocol: "https", hostname: "**.aliyuncs.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      // Any S3-compatible or CDN host you configure
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Self-hosted deployments (Aliyun ECS + Docker) build with BUILD_STANDALONE=true
  // so the image only contains the traced server runtime.
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
