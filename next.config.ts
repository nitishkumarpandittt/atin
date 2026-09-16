import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Stock photography is served from the Unsplash CDN (Unsplash License).
    // Object form: a `new URL()` pattern would reject the query strings Unsplash URLs carry.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
};

export default nextConfig;
