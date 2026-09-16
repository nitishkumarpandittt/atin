import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Boxes, FlaskConical, Layers, Package } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { CatalogueNote } from "@/components/site/CatalogueNote";
import { RequestCallButton } from "@/components/site/RequestCallButton";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { getProductBySlug, getPublishedProducts, getRange, getRelatedProducts } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";
import { brandIncludesForm, productTitle } from "@/lib/utils/text";
import { photo } from "@/lib/site/photos";

// Unlisted range/product pairs render on demand so a product that changed range can redirect.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedProducts()).map((p) => ({ range: p.rangeSlug, product: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[range]/[product]">): Promise<Metadata> {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: productTitle(product.brand, product.dosageForm),
    description: `${product.brand} (${product.dosageForm}). Composition: ${product.composition}.${product.pack ? ` Pack: ${product.pack}.` : ""}`,
    alternates: { canonical: `/products/${product.rangeSlug}/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[range]/[product]">) {
  const { range: rangeSlug, product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.rangeSlug !== rangeSlug) permanentRedirect(`/products/${product.rangeSlug}/${product.slug}`);

  const [range, related] = await Promise.all([getRange(product.rangeSlug), getRelatedProducts(product)]);
  if (!range) notFound();
  const segmentPhoto = photo(range.slug);

  const facts = [
    { icon: Package, label: "Brand", value: product.brand },
    { icon: Layers, label: "Dosage form", value: product.dosageForm },
    { icon: FlaskConical, label: "Composition", value: product.composition },
    { icon: Boxes, label: "Pack", value: product.pack },
  ].filter((f) => f.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle(product.brand, product.dosageForm),
    description: product.composition,
    category: range.shortName,
    brand: { "@type": "Brand", name: product.brand },
    url: `${site.url}/products/${range.slug}/${product.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero
        eyebrow={range.shortName}
        title={product.brand}
        photo={segmentPhoto}
        crumbs={[
          { label: "Products", href: "/products" },
          { label: range.shortName, href: `/products/${range.slug}` },
          { label: product.brand },
        ]}
        intro={brandIncludesForm(product.brand, product.dosageForm) ? range.shortName : product.dosageForm}
        overlap
      />

      <section className="container-site relative z-10 -mt-24 pb-12 md:pb-20">
        <div className="grid gap-6 rounded-3xl bg-white p-4 shadow-lift ring-1 ring-line sm:gap-8 sm:p-6 md:rounded-[2rem] md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* Visual: segment icon on a brand tile (no stock photo is presented as the product itself).
              Compact row on phones and tablets, tall centred tile beside the details on desktop. */}
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-leaf-100 p-4 sm:rounded-3xl sm:p-6 lg:grid lg:min-h-[26rem] lg:place-items-center lg:p-8">
            <div aria-hidden className="dot-grid absolute left-6 top-6 hidden h-24 w-32 opacity-70 lg:block" />
            <svg aria-hidden viewBox="0 0 120 120" className="absolute left-1/2 top-1/2 hidden size-[80%] -translate-x-1/2 -translate-y-1/2 text-sky/25 lg:block">
              <path d="M20 95 A50 50 0 1 1 100 92" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="relative flex items-center gap-4 sm:gap-5 lg:block lg:text-center">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-card sm:size-20 lg:mx-auto lg:size-32 lg:rounded-[1.75rem] lg:shadow-lift">
                <RangeIcon icon={range.icon} className="size-8 sm:size-10 lg:size-16" />
              </span>
              <div className="min-w-0 lg:mt-6">
                <p className="font-display text-lg font-extrabold leading-tight text-navy sm:text-xl lg:text-2xl">{product.brand}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-green sm:text-sm">{product.dosageForm}</p>
                <p className="mt-1 text-xs text-muted lg:hidden">Pack image available on request</p>
              </div>
            </div>
            <p className="absolute inset-x-0 bottom-4 hidden text-center text-xs text-muted lg:block">Pack image available on request</p>
          </div>

          <div className="flex flex-col">
            <p className="eyebrow text-green">Product details</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl md:text-4xl">
              {brandIncludesForm(product.brand, product.dosageForm) ? (
                product.brand
              ) : (
                <>
                  {product.brand} <span className="text-muted">{product.dosageForm}</span>
                </>
              )}
            </h2>
            <dl className="mt-6 divide-y sm:mt-8 divide-line rounded-2xl border border-line">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="grid gap-1 p-3.5 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:p-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <Icon aria-hidden className="size-4 text-brand" /> {label}
                  </dt>
                  <dd className="break-words text-ink">{value}</dd>
                </div>
              ))}
              <div className="grid gap-1 p-3.5 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:p-4">
                <dt className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <RangeIcon icon={range.icon} className="size-4 text-brand" /> Segment
                </dt>
                <dd>
                  <Link href={`/products/${range.slug}`} className="inline-block py-2 font-medium text-brand hover:underline">
                    {range.shortName}
                  </Link>
                </dd>
              </div>
            </dl>

            <div className="btn-row mt-6 sm:mt-8">
              <Link href={`/contact?product=${encodeURIComponent(productTitle(product.brand, product.dosageForm))}`} className="btn btn-green">
                Enquire about this product <ArrowRight aria-hidden className="size-4" />
              </Link>
              <RequestCallButton className="btn btn-blue" />
            </div>
            <CatalogueNote className="mt-6 sm:mt-8" />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-surface py-12 md:py-20">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <div>
                <p className="eyebrow text-green">More from {range.shortName}</p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">Related products</h2>
              </div>
              <Link href={`/products/${range.slug}`} className="link-arrow">
                View segment <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 md:mt-8 lg:grid-cols-4">
              {related.map((p, i) => (
                <li key={p.slug}>
                  <ProductCard product={p} icon={range.icon} tone={i % 2 ? "green" : "blue"} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {segmentPhoto && (
        <section className="container-site py-12 md:py-16">
          <div className="relative isolate overflow-hidden rounded-3xl md:rounded-[2rem]">
            <Image src={segmentPhoto.src} alt={segmentPhoto.alt} fill sizes="100vw" className="-z-10 object-cover" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/60 sm:via-navy/80 sm:to-navy/30" />
            <div className="max-w-xl p-6 text-white sm:p-8 md:p-12">
              <h2 className="text-2xl font-bold !text-white md:text-3xl">Explore the full {range.shortName.toLowerCase()} segment</h2>
              <p className="mt-3 text-white/80">{range.productCount} products listed with composition and pack details.</p>
              <Link href={`/products/${range.slug}`} className="btn btn-white mt-6">
                View all {range.productCount} <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
