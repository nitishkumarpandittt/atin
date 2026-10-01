import type { Metadata } from "next";
import { pageMeta } from "@/lib/site/seo";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { CatalogueNote } from "@/components/site/CatalogueNote";
import { RequestCallButton } from "@/components/site/RequestCallButton";
import { CollapseToggle } from "@/components/site/CollapseToggle";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { getMainImages, getProductsInRange, getRange, getRanges } from "@/lib/data/catalogue";
import { rangePhoto } from "@/lib/site/photos";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getRanges()).map((r) => ({ range: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[range]">): Promise<Metadata> {
  const range = await getRange((await params).range);
  if (!range) return {};
  return pageMeta({
    title: range.shortName,
    description: `${range.shortName} from Atin HealthCare: ${range.productCount} products including ${range.dosageForms.slice(0, 4).join(", ").toLowerCase()}.`,
    path: `/products/${range.slug}`,
  });
}

export default async function RangePage({ params }: PageProps<"/products/[range]">) {
  const { range: slug } = await params;
  const [range, ranges, images] = await Promise.all([getRange(slug), getRanges(), getMainImages()]);
  if (!range) notFound();
  const products = await getProductsInRange(slug);
  const others = ranges.filter((r) => r.slug !== slug);
  const img = rangePhoto(range);
  const formCounts = range.dosageForms
    .map((f) => ({ form: f, count: products.filter((p) => p.dosageForm === f).length }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <PageHero
        eyebrow="Product segment"
        title={range.shortName}
        photo={img}
        crumbs={[{ label: "Products", href: "/products" }, { label: range.shortName }]}
        intro={
          <>
            {range.productCount} {range.productCount === 1 ? "product" : "products"} in {range.dosageForms.length}{" "}
            {range.dosageForms.length === 1 ? "format" : "formats"}.
          </>
        }
      >
        <ul className="mt-6 flex flex-wrap gap-2 md:mt-7">
          {formCounts.map(({ form, count }) => (
            <li key={form} className="rounded-full bg-white/12 px-3.5 py-1.5 text-sm text-white ring-1 ring-white/20 backdrop-blur-sm">
              {form} <span className="text-white/65">· {count}</span>
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="container-site py-10 md:py-16 lg:py-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 md:mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">Products in this segment</h2>
          <Link href={`/products?range=${slug}`} className="link-arrow text-sm">
            Search and filter <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <ul id="range-products" data-collapsible className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.slug}>
              <ProductCard product={{ ...p, image: images.get(p.id)?.src }} icon={range.icon} tone={i % 2 ? "green" : "blue"} fallbackImage={img?.src} />
            </li>
          ))}
        </ul>
        <CollapseToggle listId="range-products" total={products.length} />
        <CatalogueNote className="mt-10 md:mt-12" />
      </section>

      {/* Enquiry strip with the segment photo */}
      <section className="container-site pb-6">
        <div className="relative isolate grid overflow-hidden rounded-3xl bg-navy text-white md:grid-cols-2 md:rounded-[2rem]">
          <div className="relative p-6 sm:p-8 lg:p-12">
            <div aria-hidden className="hex-pattern absolute inset-0" />
            <p className="eyebrow relative text-sky-100">Trade enquiries</p>
            <h2 className="relative mt-3 text-2xl font-bold !text-white md:text-3xl">Looking for {range.shortName.toLowerCase()}?</h2>
            <p className="relative mt-3 max-w-md text-white/80">Tell us the brands and quantities you need and our team will get back to you.</p>
            <div className="btn-row relative mt-7">
              <Link href={`/contact?product=${encodeURIComponent(range.shortName)}`} className="btn btn-green">
                Send an enquiry <ArrowRight aria-hidden className="size-4" />
              </Link>
              <RequestCallButton className="btn btn-outline-light" />
            </div>
          </div>
          <div className="relative order-first min-h-44 sm:min-h-56 md:order-none">
            {img ? (
              <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" style={{ objectPosition: img.position }} />
            ) : (
              <div className="grid h-full place-items-center bg-brand">
                <RangeIcon icon={range.icon} className="size-24 text-white/40" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface py-12 md:py-20">
        <div className="container-site">
          <SectionHeading title="Other segments" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 md:mt-10 lg:grid-cols-3">
            {others.map((r, i) => (
              <li key={r.slug}>
                <Link
                  href={`/products/${r.slug}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-sky/40"
                >
                  <span className={`grid size-12 place-items-center rounded-xl ${i % 2 ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand"}`}>
                    <RangeIcon icon={r.icon} className="size-6" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-navy">{r.shortName}</span>
                    <span className="text-sm text-muted">{r.productCount} products</span>
                  </span>
                  <ArrowRight aria-hidden className="size-4 text-brand transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
