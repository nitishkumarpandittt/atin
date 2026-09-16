import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { PageHero } from "@/components/site/PageHero";
import { photo } from "@/lib/site/photos";

export default function NotFound() {
  return (
    <SiteChrome>
      <PageHero eyebrow="Error 404" title="We couldn't find that page" intro="The link may be out of date, or the page may have moved." photo={photo("blog-2")} />
      <section className="container-site py-10 md:py-16 lg:py-24">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { href: "/", label: "Home page", text: "Start from the beginning" },
            { href: "/products", label: "Products", text: "Search the catalogue" },
            { href: "/contact", label: "Contact", text: "Ask our trade team" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="group rounded-2xl bg-white p-6 shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex items-center justify-between font-bold text-navy">
                {l.label} <ArrowRight aria-hidden className="size-4 text-brand transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-1 block text-sm text-muted">{l.text}</span>
            </Link>
          ))}
        </div>
        <p className="mt-8 flex items-start justify-center gap-2 text-center text-sm text-muted md:mt-10 md:items-center">
          <Search aria-hidden className="size-4" /> Looking for a product? Try searching by brand or composition on the products page.
        </p>
      </section>
    </SiteChrome>
  );
}
