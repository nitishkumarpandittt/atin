import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Range } from "@/lib/data/catalogue";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { photo } from "@/lib/site/photos";

export function SegmentGrid({ ranges, totalProducts }: { ranges: Range[]; totalProducts: number }) {
  return (
    <section aria-labelledby="segments-title" className="relative bg-surface py-14 md:py-20 lg:py-28">
      <div className="dot-grid absolute right-0 top-10 hidden h-40 w-56 opacity-60 sm:block" aria-hidden />
      <div className="container-site relative">
        {/* 2 columns of compact cards on phones and tablets, 3 on desktop: intro + 10 segments + "view all" = 12 cells. */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {/* Cell 1: intro (Remedial "Different Types of Departments") */}
          <li className="col-span-2 flex flex-col justify-center pb-3 sm:pb-4 lg:col-span-1 lg:pb-0 lg:pr-6">
            <SectionHeading
              id="segments-title"
              eyebrow="Our portfolio"
              title="Product segments"
              intro={`${totalProducts} products organised into ${ranges.length} segments, so you can find the right format quickly.`}
            />
            <Link href="/products" className="link-arrow mt-4 lg:mt-7" data-reveal>
              Browse the full catalogue <ArrowRight aria-hidden className="size-4" />
            </Link>
          </li>

          {ranges.map((r, i) => {
            const img = photo(r.slug);
            return (
              <li key={r.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}>
                <Link
                  href={`/products/${r.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:bg-green hover:shadow-lift hover:ring-green focus-visible:bg-green focus-visible:ring-green sm:rounded-[var(--radius-card)]"
                >
                  <span className="relative block h-24 overflow-hidden bg-sky-100 sm:h-32 lg:h-36">
                    {img && (
                      <Image
                        src={img.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 380px, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
                  </span>
                  <span className="flex flex-1 flex-col px-3.5 pb-4 sm:px-6 sm:pb-6 lg:px-7 lg:pb-7">
                    <span
                      className={`relative -mt-5 grid size-10 place-items-center rounded-xl shadow-card ring-4 ring-white transition-colors group-hover:ring-green group-focus-visible:ring-green sm:-mt-7 sm:size-14 sm:rounded-2xl ${
                        i % 2 ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand"
                      }`}
                    >
                      <RangeIcon icon={r.icon} className="size-5 sm:size-7" />
                    </span>
                    <h3 className="mt-3 text-[0.95rem] font-bold leading-snug transition-colors group-hover:!text-white group-focus-visible:!text-white sm:mt-5 sm:text-xl">
                      {r.shortName}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted transition-colors group-hover:text-white/85 group-focus-visible:text-white/85 sm:mt-2 sm:text-sm">
                      {r.productCount} {r.productCount === 1 ? "product" : "products"}
                      {r.dosageForms.length > 1 && <span className="hidden sm:inline"> · {formatForms(r.dosageForms)}</span>}
                    </p>
                    <span className="mt-auto hidden items-center gap-1.5 pt-6 text-sm font-semibold text-brand transition-colors group-hover:text-white group-focus-visible:text-white sm:inline-flex">
                      View range <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Final cell closes the grid */}
          <li data-reveal className="col-span-2 lg:col-span-1">
            <Link
              href="/products"
              className="group relative isolate flex h-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-navy text-white shadow-card ring-1 ring-navy transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:rounded-[var(--radius-card)]"
            >
              <span aria-hidden className="hex-pattern absolute inset-0 -z-10" />
              <span aria-hidden className="absolute -right-24 -top-24 -z-10 size-56 rounded-full border-[14px] border-white/[0.07]" />

              {/* Padding lives on this wrapper, matching the segment cards. */}
              <span className="flex w-full flex-col justify-between gap-6 p-5 sm:p-7 lg:p-8">
                <span className="flex items-start justify-between gap-4">
                  <span className="eyebrow rounded-full bg-white/10 px-3 py-1.5 text-sky-100 ring-1 ring-white/15">Full catalogue</span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-navy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-12">
                    <ArrowUpRight aria-hidden className="size-5 sm:size-6" />
                  </span>
                </span>

                <span aria-hidden className="flex -space-x-2">
                  {ranges.slice(0, 6).map((r) => (
                    <span key={r.slug} className="grid size-9 place-items-center rounded-full bg-white text-brand ring-2 ring-navy sm:size-10">
                      <RangeIcon icon={r.icon} className="size-4 sm:size-5" />
                    </span>
                  ))}
                  <span className="grid size-9 place-items-center rounded-full bg-leaf text-xs font-bold text-white ring-2 ring-navy sm:size-10">
                    +{Math.max(ranges.length - 6, 0)}
                  </span>
                </span>

                <span className="block">
                  <span className="block font-display text-xl font-extrabold leading-tight sm:text-2xl">View all {totalProducts} products</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-white/75">Search by brand, composition or pack and filter by segment.</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    Browse catalogue <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

function formatForms(forms: string[]) {
  const shown = forms.slice(0, 3).join(", ");
  return forms.length > 3 ? `${shown} +${forms.length - 3}` : shown;
}
