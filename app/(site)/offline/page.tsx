import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

// Shown by the service worker (public/sw.js) when a page is requested without a connection.
// No photo or optimised images here: they would need the network this page exists for.
export const metadata: Metadata = {
  title: "You are offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <>
      <PageHero eyebrow="No connection" title="You are offline" intro="Check your internet connection, then try again." />
      <section className="container-site py-12 text-center md:py-16">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-sky-100 text-brand">
          <WifiOff aria-hidden className="size-7" />
        </span>
        <p className="mx-auto mt-5 max-w-md text-muted">Pages need a connection to show current product and contact details.</p>
        {/* A full reload on purpose: retrying offline needs a real request, not a client-side transition. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="btn btn-blue mt-7">
          Try again
        </a>
      </section>
    </>
  );
}
