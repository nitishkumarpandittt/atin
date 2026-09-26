import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Pharmaceutical Marketing & Distribution`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Pharmaceutical Marketing & Distribution`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0054b4",
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
        {children}
      </body>
    </html>
  );
}
