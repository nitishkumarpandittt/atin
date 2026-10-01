import type { Metadata } from "next";
import { pageMeta } from "@/lib/site/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { CatalogueNote } from "@/components/site/CatalogueNote";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { getMainImages, getNewAdditions, getRanges } from "@/lib/data/catalogue";
import { photo, rangePhoto } from "@/lib/site/photos";

export const metadata: Metadata = pageMeta({
  title: "New additions",
  description: "Recently added products in the Atin HealthCare catalogue.",
  path: "/products/new-additions",
});

export default async function NewAdditionsPage() {
  const [products, ranges, images] = await Promise.all([getNewAdditions(), getRanges(), getMainImages()]);
  const rangeBySlug = new Map(ranges.map((r) => [r.slug, r]));

  return (
    <>
      <PageHero
        eyebrow="Product catalogue"
        title="New additions"
        intro="Products recently added to our portfolio."
        photo={photo("chemist-counter")}
        crumbs={[{ label: "Products", href: "/products" }, { label: "New additions" }]}
      />
      <section className="container-site py-10 md:py-16 lg:py-20">
        {products.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => {
              const range = rangeBySlug.get(p.rangeSlug);
              return (
                <li key={p.slug}>
                  <ProductCard
                    product={{ ...p, image: images.get(p.id)?.src }}
                    rangeName={range?.shortName}
                    icon={range?.icon ?? ""}
                    tone={i % 2 ? "green" : "blue"}
                    fallbackImage={range ? rangePhoto(range)?.src : undefined}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid items-center gap-8 rounded-3xl bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-10 lg:p-12">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">New products will be listed here</h2>
              <p className="mt-3 max-w-xl text-muted">
                In the meantime, explore the full catalogue by segment, or ask our trade team about upcoming additions.
              </p>
              <div className="btn-row mt-6">
                <Link href="/products" className="btn btn-blue">
                  Browse all products <ArrowRight aria-hidden className="size-4" />
                </Link>
                <Link href="/contact" className="btn btn-green">
                  Ask our team
                </Link>
              </div>
            </div>
            <ul className="grid grid-cols-5 gap-2 sm:gap-3">
              {ranges.map((r, i) => (
                <li key={r.slug}>
                  <Link
                    href={`/products/${r.slug}`}
                    title={r.shortName}
                    className={`grid aspect-square w-full place-items-center rounded-xl bg-white shadow-card ring-1 ring-line transition hover:-translate-y-0.5 sm:size-14 sm:rounded-2xl ${i % 2 ? "text-green" : "text-brand"}`}
                  >
                    <RangeIcon icon={r.icon} className="size-6" />
                    <span className="sr-only">{r.shortName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <CatalogueNote className="mt-10 md:mt-14" />
      </section>
    </>
  );
}
