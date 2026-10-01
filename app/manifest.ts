import type { MetadataRoute } from "next";
import { site } from "@/lib/site/config";

// Web app manifest: lets phones and desktops install the site as an app (home-screen icon, own window).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.legalName,
    short_name: "Atin",
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0054b4",
    lang: "en-IN",
    categories: ["business", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Products", url: "/products", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Send an enquiry", url: "/contact", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
