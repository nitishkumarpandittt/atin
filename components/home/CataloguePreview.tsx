import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PreviewItem } from "@/lib/data/catalogue";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { rangePhoto } from "@/lib/site/photos";

type Item = PreviewItem;

export function CataloguePreview({ items, title, eyebrow }: { items: Item[]; title: string; eyebrow: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="preview-title" className="py-14 md:py-20 lg:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <SectionHeading id="preview-title" eyebrow={eyebrow} title={title} intro="A sample from each segment. Every listing shows composition and pack details." />
          <Link href="/products" className="btn btn-blue" data-reveal>
            All products <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <ul className="-mx-5 mt-8 flex md:mt-12 snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-6 [scrollbar-width:thin] md:-mx-8 md:scroll-px-8 md:px-8">
          {items.map(({ product: p, range: r, image }, i) => {
            // No pack shot yet: the segment's photo stands in behind the icon tile.
            const fallback = image ? undefined : rangePhoto(r);
            return (
            <li key={p.slug} className="w-[78%] max-w-[17.5rem] shrink-0 snap-start sm:w-[17.5rem]" data-reveal style={{ "--reveal-delay": `${Math.min(i, 4) * 60}ms` } as React.CSSProperties}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                <div className={`relative grid h-36 place-items-center overflow-hidden ${i % 2 ? "bg-leaf-100" : "bg-sky-100"}`}>
                  <svg aria-hidden viewBox="0 0 120 120" className={`absolute -bottom-10 -right-8 size-40 ${i % 2 ? "text-leaf/25" : "text-sky/25"}`}>
                    <path d="M20 95 A50 50 0 1 1 100 92" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                  {image ? (
                    /* Pack shot on the tint (multiply drops its white background); the segment icon shrinks to a corner badge. */
                    <>
                      <Image src={image} alt="" fill sizes="280px" className="object-contain p-4 pt-9 mix-blend-multiply transition duration-500 group-hover:scale-105" />
                      <span className={`absolute bottom-3 right-3 grid size-9 place-items-center rounded-xl bg-white shadow-card ${i % 2 ? "text-green" : "text-brand"}`}>
                        <RangeIcon icon={r.icon} className="size-5" />
                      </span>
                    </>
                  ) : (
                    <>
                      {fallback && (
                        <>
                          <Image src={fallback.src} alt="" fill sizes="280px" className="object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: fallback.position }} />
                          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/50 to-navy/10" />
                        </>
                      )}
                      <span className={`relative grid size-16 place-items-center rounded-2xl bg-white shadow-card ${i % 2 ? "text-green" : "text-brand"}`}>
                        <RangeIcon icon={r.icon} className="size-8" />
                      </span>
                    </>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy">{r.shortName}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold leading-snug">
                    <Link href={`/products/${r.slug}/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {p.brand}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-green">{p.dosageForm}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{p.composition}</p>
                  {p.pack && (
                    <p className="mt-auto pt-4 text-xs font-medium text-navy/70">
                      <span className="text-muted">Pack:</span> {p.pack}
                    </p>
                  )}
                </div>
              </article>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
