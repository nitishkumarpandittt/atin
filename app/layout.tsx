import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site/config";
import { ogDefaults } from "@/lib/site/seo";
import { getSeoSettings } from "@/lib/data/seo";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const homeTitle = `${site.name} | Pharmaceutical Marketing & Distribution`;

const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: homeTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  category: "Pharmaceutical",
  keywords: ["Atin HealthCare", "pharmaceutical distribution", "pharma marketing company", "PCD pharma", "tablets", "syrups", "injectables", "ayurvedic", "Panchkula", "Haryana", "India"],
  alternates: { canonical: "/" },
  openGraph: { ...ogDefaults, title: homeTitle, description: site.description, url: "/" },
  twitter: { card: "summary_large_image", title: homeTitle, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Installed app (iOS home screen); the manifest is linked automatically from app/manifest.ts.
  appleWebApp: { capable: true, title: "Atin", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
};

// Search Console / Bing verification tags come from Admin → SEO (GOOGLE_SITE_VERIFICATION env as a fallback).
export async function generateMetadata(): Promise<Metadata> {
  const { googleVerification, bingVerification } = await getSeoSettings();
  const verification = {
    ...(googleVerification && { google: googleVerification }),
    ...(bingVerification && { other: { "msvalidate.01": bingVerification } }),
  };
  return Object.keys(verification).length ? { ...baseMetadata, verification } : baseMetadata;
}

export const viewport: Viewport = {
  themeColor: "#0054b4",
  colorScheme: "light",
  // Lets content use the full screen on notched phones; fixed elements add safe-area padding.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Bitdefender) stamp attributes on <body> before React hydrates. */}
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Script id="js-enabled" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js")`}
        </Script>
        {/* Links and images are draggable by default (Firefox ignores the CSS rule in globals.css); block it everywhere. */}
        <Script id="no-drag" strategy="beforeInteractive">
          {`document.addEventListener("dragstart",function(e){var t=e.target;if(t instanceof Element&&t.closest("a,img"))e.preventDefault()})`}
        </Script>
        {children}
      </body>
    </html>
  );
}
