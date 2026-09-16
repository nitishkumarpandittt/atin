import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import type { Photo } from "@/lib/site/photos";

type Props = { figures: { products: number; ranges: number; dosageForms: number }; photo: Photo };

const points = [
  "Multi-segment portfolio under one brand family",
  "Serving distributors, chemists, hospitals and institutions",
  "Product documentation shared on request",
];

export function AboutTeaser({ figures, photo }: Props) {
  const stats = [
    { value: figures.products, label: "Products in the catalogue", short: "Products" },
    { value: figures.ranges, label: "Product segments", short: "Segments" },
    { value: figures.dosageForms, label: "Dosage forms & formats", short: "Dosage forms" },
  ];

  return (
    <section aria-labelledby="about-title" className="relative py-14 md:py-20 lg:py-28">
      <div className="container-site grid items-center gap-10 md:gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            id="about-title"
            eyebrow="About Atin HealthCare"
            title="A dependable partner for the pharma trade"
            intro="Atin HealthCare is a pharmaceutical marketing and distribution company. We bring together a wide, well-organised product range so our trade partners can source across segments from a single point of contact."
          />
          <ul className="mt-6 space-y-3 md:mt-8 md:space-y-3.5" data-reveal>
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-green" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/about" className="link-arrow mt-5 md:mt-8" data-reveal>
            More about us <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        {/* Pavilion offset photo panel with arc-ringed figures overlapping it */}
        <div className="relative pb-16 sm:pb-12" data-reveal>
          <div aria-hidden className="absolute -right-5 -top-5 bottom-24 left-12 hidden rounded-[2rem] bg-surface sm:block md:-right-8" />
          <div aria-hidden className="dot-grid absolute -left-3 top-10 h-28 w-32 opacity-70" />
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl shadow-lift sm:aspect-[16/9] sm:rounded-[2rem] lg:aspect-[5/4]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent" />
          </div>
          <ul className="absolute inset-x-3 bottom-0 grid grid-cols-3 gap-2 sm:inset-x-6 sm:gap-4">
            {stats.map((s, i) => (
              <li
                key={s.label}
                className={`relative overflow-hidden rounded-2xl p-3 shadow-lift ring-1 sm:p-4 lg:p-5 ${i === 0 ? "bg-brand text-white ring-brand" : "bg-white ring-line"}`}
              >
                <svg aria-hidden viewBox="0 0 120 120" className={`absolute -right-5 -top-5 size-20 ${i === 0 ? "text-white/20" : "text-sky/20"}`}>
                  <path d="M20 95 A50 50 0 1 1 100 92" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
                </svg>
                <p className={`font-display text-[1.75rem] font-extrabold leading-none sm:text-4xl ${i === 0 ? "text-white" : "text-navy"}`}>
                  <CountUp value={s.value} />
                </p>
                <p className={`mt-2 text-xs font-medium leading-snug ${i === 0 ? "text-white/80" : "text-muted"}`}><span className="sm:hidden">{s.short}</span><span className="hidden sm:inline">{s.label}</span></p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
