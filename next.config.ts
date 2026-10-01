import type { NextConfig } from "next";

const maxUploadMb = Math.max(1, Number(process.env.MAX_UPLOAD_MB) || 5);

const nextConfig: NextConfig = {
  images: {
    // Stock photography from the Unsplash CDN (Unsplash License). Object form: a `new URL()` pattern would
    // reject the query strings Unsplash URLs carry.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  experimental: {
    // Admin uploads send one image per request; allow the image plus form overhead.
    serverActions: { bodySizeLimit: `${maxUploadMb + 1}mb` },
  },
  // sharp and mysql2 are native/Node-only; keep them out of the server bundle.
  serverExternalPackages: ["sharp", "mysql2"],
  // The public blog was retired; its URLs were briefly indexed.
  // The service worker must never be cached, or clients keep running an old version.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/blog/:path*", destination: "/", permanent: true }];
  },
};

export default nextConfig;
