import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Range } from "@/lib/data/catalogue";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { SectionHeading } from "@/components/primitives/SectionHeading";

export function SegmentGrid({ ranges, totalProducts }: { ranges: Range[]; totalProducts: number }) {
  return (
    <section aria-labelledby="segments-title" className="relative bg-surface py-20 md:py-28">
      <div className="dot-grid absolute right-0 top-10 h-40 w-56 opacity-60" aria-hidden />
      <div className="container-site relative">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Cell 1: intro (Remedial "Different Types of Departments") */}
          <li className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 lg:pr-6">
            <SectionHeading
              id="segments-title"
              eyebrow="Our portfolio"
              title="Product segments"
              intro={`${totalProducts} products organised into ${ranges.length} segments, so you can find the right format quickly.`}
            />
            <Link href="/products" className="link-arrow mt-7" data-reveal>
              Browse the full catalogue <ArrowRight aria-hidden className="size-4" />
            </Link>
          </li>

          {ranges.map((r, i) => (
            <li key={r.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}>
              <Link
                href={`/products/${r.slug}`}
                className="group relative flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 shadow-card ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:bg-green hover:shadow-lift hover:ring-green focus-visible:bg-green focus-visible:ring-green"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl transition-colors group-hover:bg-white/15 group-hover:text-white group-focus-visible:bg-white/15 group-focus-visible:text-white ${
                    i % 2 ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand"
                  }`}
                >
                  <RangeIcon icon={r.icon} className="size-7" />
                </span>
                <h3 className="mt-6 text-xl font-bold transition-colors group-hover:!text-white group-focus-visible:!text-white">{r.shortName}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted transition-colors group-hover:text-white/85 group-focus-visible:text-white/85">
                  {r.productCount} {r.productCount === 1 ? "product" : "products"}
                  {r.dosageForms.length > 1 && <> · {formatForms(r.dosageForms)}</>}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand transition-colors group-hover:text-white group-focus-visible:text-white">
                  View range <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}

          {/* Final cell closes the grid (3 × 4 on desktop) */}
          <li data-reveal>
            <Link
              href="/products"
              className="group relative flex h-full min-h-56 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-navy p-7 text-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="hex-pattern absolute inset-0" aria-hidden />
              <span className="relative grid size-14 place-items-center rounded-2xl bg-white/10">
                <ArrowUpRight aria-hidden className="size-7 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="relative">
                <span className="block font-display text-2xl font-extrabold">View all {totalProducts} products</span>
                <span className="mt-2 block text-sm text-white/75">Search and filter the complete catalogue</span>
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
