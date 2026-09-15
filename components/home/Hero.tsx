import Link from "next/link";
import { ArrowRight, Boxes, Layers } from "lucide-react";
import { HeroVisual } from "@/components/home/HeroVisual";
import { ProductSearch } from "@/components/home/ProductSearch";
import type { Range } from "@/lib/data/catalogue";

type Props = {
  figures: { products: number; ranges: number; dosageForms: number };
  ranges: Range[];
};

// Blue panel: straight diagonal that sweeps into the bottom edge (Remedial reference), expressed as
// a percentage polygon so it scales with the hero. The visual panel runs parallel to it.
const BLUE_PANEL =
  "polygon(0 0, 77% 0, 62% 78%, 60.2% 86%, 57.6% 92.4%, 54.2% 96.6%, 50% 99.2%, 45% 100%, 0 100%)";
const VISUAL_PANEL = "polygon(80.5% 0, 100% 0, 100% 90%, 61.5% 100%, 64.2% 86%)";

export function Hero({ figures, ranges }: Props) {
  return (
    <section aria-labelledby="hero-title" className="relative bg-white">
      <div className="relative overflow-hidden bg-brand lg:bg-transparent">
        {/* Desktop backgrounds */}
        <div aria-hidden className="absolute inset-0 hidden lg:block" style={{ clipPath: VISUAL_PANEL }}>
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-leaf-100" />
          <div className="dot-grid absolute right-10 top-28 h-40 w-40 opacity-60" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-br from-brand-600 via-brand to-blue-800 lg:block"
          style={{ clipPath: BLUE_PANEL }}
        >
          <div className="hex-pattern absolute inset-0" />
          <div className="absolute -left-40 -top-40 size-[34rem] rounded-full border-[18px] border-white/5" />
        </div>
        {/* Mobile/tablet background */}
        <div aria-hidden className="hex-pattern absolute inset-0 lg:hidden" />

        <div className="container-site relative grid items-center gap-8 pb-28 pt-32 lg:min-h-[44rem] lg:grid-cols-[1.08fr_1fr] lg:pb-48 lg:pt-36">
          <div className="text-white">
            <p className="eyebrow text-sky-100" data-reveal>
              Pharmaceutical marketing &amp; distribution
            </p>
            <h1
              id="hero-title"
              className="mt-5 max-w-xl text-[2.35rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-[3.6rem] lg:leading-[1.06]"
              data-reveal
              style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            >
              Pharma ranges that reach <span className="relative whitespace-nowrap">every counter.
                <svg aria-hidden viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path d="M3 12 C 80 2, 200 2, 297 9" fill="none" stroke="#4CAA1C" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p
              className="mt-7 max-w-lg text-base leading-relaxed text-white/85 md:text-lg"
              data-reveal
              style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
            >
              Atin HealthCare markets and distributes {figures.products} products across {figures.ranges} segments, from
              tablets and syrups to injectables, ayurvedic, dental and eye-care ranges, for the pharma trade.
            </p>
            <div className="mt-9 flex flex-wrap gap-3" data-reveal style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
              <Link href="/products" className="btn btn-green">
                Explore products <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline-light">
                Become a partner
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:translate-x-8">
            <div className="absolute inset-6 rounded-full bg-white/10 blur-2xl lg:hidden" aria-hidden />
            <HeroVisual className="relative w-full drop-shadow-sm" />
            <div className="absolute left-0 top-[12%] hidden items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-lift ring-1 ring-line motion-safe:animate-float sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-sky-100 text-brand">
                <Boxes aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-extrabold leading-none text-navy">{figures.products}</span>
                <span className="text-xs font-medium text-muted">products</span>
              </span>
            </div>
            <div className="absolute bottom-[14%] right-0 hidden items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-lift ring-1 ring-line motion-safe:animate-[float_8s_ease-in-out_infinite] sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-leaf-100 text-green">
                <Layers aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-extrabold leading-none text-navy">{figures.ranges}</span>
                <span className="text-xs font-medium text-muted">segments</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search card straddling the hero edge */}
      <div className="container-site relative z-20 -mt-16 lg:-mt-28">
        <div className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-line md:p-7 lg:max-w-[52rem]" data-reveal>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold md:text-xl">Find a product</h2>
            <p className="text-sm text-muted">Search {figures.products} products by brand or composition</p>
          </div>
          <ProductSearch ranges={ranges.map((r) => ({ slug: r.slug, shortName: r.shortName }))} />
        </div>
      </div>
    </section>
  );
}
