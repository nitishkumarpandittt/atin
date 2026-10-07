import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Layers } from "lucide-react";
import { ProductSearch } from "@/components/home/ProductSearch";
import type { Range } from "@/lib/data/catalogue";
import type { Photo } from "@/lib/site/photos";

type Props = {
  figures: { products: number; ranges: number; dosageForms: number };
  ranges: Range[];
  photo: Photo;
};

// Blue panel: straight diagonal that sweeps into the bottom edge (Remedial reference), expressed as
// a percentage polygon so it scales with the hero. The photo panel runs parallel to it.
const BLUE_PANEL = "polygon(0 0, 70% 0, 57% 78%, 55.2% 86%, 52.6% 92.4%, 49.2% 96.6%, 45% 99.2%, 40% 100%, 0 100%)";
const PHOTO_PANEL = "polygon(73.5% 0, 100% 0, 100% 90%, 56.5% 100%, 59.2% 86%)";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export function Hero({ figures, ranges, photo }: Props) {
  return (
    <section aria-labelledby="hero-title" className="relative bg-white">
      <div className="relative overflow-hidden bg-brand lg:bg-transparent">
        {/* Desktop: photo panel. The photo box only spans the clipped region (a tall, roughly 7:10 area),
            so a portrait photo fills it at native scale and `position` frames the subject within what is
            actually visible rather than the full hero width. */}
        <div aria-hidden className="absolute inset-0 hidden lg:block" style={{ clipPath: PHOTO_PANEL }}>
          <div className="absolute inset-y-0 left-[56%] right-0">
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="45vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
              style={{ objectPosition: photo.position ?? "center" }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-navy/45 via-transparent to-navy/10" />
        </div>
        {/* Desktop: blue panel */}
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-br from-brand-600 via-brand to-blue-800 lg:block" style={{ clipPath: BLUE_PANEL }}>
          <div className="hex-pattern absolute inset-0" />
          <div className="absolute -left-40 -top-40 size-[34rem] rounded-full border-[18px] border-white/5" />
        </div>
        {/* Mobile/tablet background */}
        <div aria-hidden className="hex-pattern absolute inset-0 lg:hidden" />

        <div className="container-site relative grid items-center gap-10 pb-24 pt-28 sm:pt-32 lg:min-h-[44rem] lg:grid-cols-[1.1fr_1fr] lg:pb-52 lg:pt-36 xl:min-h-[46rem]">
          <div className="text-white lg:pr-10">
            <p className="eyebrow text-sky-100" data-reveal>
              Pharmaceutical marketing &amp; distribution
            </p>
            <h1
              id="hero-title"
              className="mt-4 max-w-xl text-[2.3rem] font-extrabold leading-[1.1] !text-white sm:mt-5 sm:text-5xl lg:text-[3.1rem] lg:leading-[1.08] xl:text-[3.6rem] xl:leading-[1.06]"
              data-reveal
              style={delay(80)}
            >
              Pharma ranges that reach{" "}
              <span className="relative whitespace-nowrap">
                every counter.
                <svg aria-hidden viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path d="M3 12 C 80 2, 200 2, 297 9" fill="none" stroke="#4CAA1C" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:mt-7 md:text-lg" data-reveal style={delay(160)}>
              Atin HealthCare markets and distributes {figures.products} products across {figures.ranges} segments, from tablets and syrups
              to injectables, ayurvedic, dental and eye-care ranges, for the pharma trade.
            </p>
            <div className="btn-row mt-8 md:mt-9" data-reveal style={delay(240)}>
              <Link href="/products" className="btn btn-green">
                Explore products <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline-light">
                Become a partner
              </Link>
            </div>
          </div>

          {/* Photo card on small screens; floating figure chips over the panel on desktop */}
          <div className="relative lg:h-full">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift ring-4 ring-white/15 sm:aspect-[16/9] sm:rounded-[2rem] lg:hidden">
              <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: photo.position ?? "center" }} />
            </div>
            <FigureChip
              className="-bottom-5 left-3 sm:left-5 lg:bottom-auto lg:left-[20%] lg:top-[22%]"
              icon={<Boxes aria-hidden className="size-5" />}
              tint="bg-sky-100 text-brand"
              value={figures.products}
              label="products"
            />
            <FigureChip
              className="-bottom-5 right-3 sm:right-5 lg:bottom-[8%] lg:right-0"
              icon={<Layers aria-hidden className="size-5" />}
              tint="bg-leaf-100 text-green"
              value={figures.ranges}
              label="segments"
              slow
            />
          </div>
        </div>
      </div>

      {/* Search card straddling the hero edge */}
      <div className="container-site relative z-20 -mt-14 lg:-mt-28">
        <div className="rounded-3xl bg-white p-4 shadow-lift ring-1 ring-line sm:p-5 md:p-7 lg:max-w-[46rem] xl:max-w-[50rem]" data-reveal>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold md:text-xl">Find a product</h2>
            <p className="hidden text-sm text-muted sm:block">Search {figures.products} products by brand or composition</p>
          </div>
          <ProductSearch ranges={ranges.map((r) => ({ slug: r.slug, shortName: r.shortName }))} />
        </div>
      </div>
    </section>
  );
}

function FigureChip({
  className,
  icon,
  tint,
  value,
  label,
  slow = false,
}: {
  className: string;
  icon: React.ReactNode;
  tint: string;
  value: number;
  label: string;
  slow?: boolean;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-2xl bg-white/95 p-2 pr-3 shadow-lift sm:gap-3 sm:p-3 sm:pr-5 ring-1 ring-line backdrop-blur ${
        slow ? "motion-safe:animate-[float_8s_ease-in-out_infinite]" : "motion-safe:animate-float"
      } ${className}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint}`}>{icon}</span>
      <span>
        <span className="block font-display text-xl font-extrabold leading-none text-navy">{value}</span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </span>
    </div>
  );
}
