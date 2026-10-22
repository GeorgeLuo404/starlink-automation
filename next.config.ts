import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root — otherwise Next walks up to $HOME and warns about
  // unrelated lockfiles it finds there.
  turbopack: { root: process.cwd() },
  // The site used to live under /zh and /en; keep old links and search results working.
  async redirects() {
    return [
      { source: "/:locale(zh|en)", destination: "/", permanent: true },
      { source: "/:locale(zh|en)/:path*", destination: "/:path*", permanent: true },
    ];
  },
  // Uploaded files are always addressed as /uploads/<key> on this domain (see
  // src/lib/storage.ts). With the s3 driver, proxy that path to the bucket so
  // visitors never reach the storage host directly. Rewrites are resolved at
  // build time — on Vercel both variables are set for the build; on ECS nginx
  // proxies /uploads instead (docs/DEPLOYMENT.md).
  async rewrites() {
    const bucket = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (process.env.STORAGE_DRIVER !== "s3" || !bucket) return [];
    return [{ source: "/uploads/:path*", destination: `${bucket}/:path*` }];
  },
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
