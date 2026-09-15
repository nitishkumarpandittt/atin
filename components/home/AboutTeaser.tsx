import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHeading } from "@/components/primitives/SectionHeading";

type Props = { figures: { products: number; ranges: number; dosageForms: number } };

const points = [
  "Multi-segment portfolio under one brand family",
  "Serving distributors, chemists, hospitals and institutions",
  "Product documentation shared on request",
];

export function AboutTeaser({ figures }: Props) {
  const stats = [
    { value: figures.products, label: "Products in the catalogue" },
    { value: figures.ranges, label: "Product segments" },
    { value: figures.dosageForms, label: "Dosage forms & formats" },
  ];

  return (
    <section aria-labelledby="about-title" className="relative py-20 md:py-28">
      <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            id="about-title"
            eyebrow="About Atin HealthCare"
            title="A dependable partner for the pharma trade"
            intro="Atin HealthCare is a pharmaceutical marketing and distribution company. We bring together a wide, well-organised product range so our trade partners can source across segments from a single point of contact."
          />
          <ul className="mt-8 space-y-3.5" data-reveal>
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-green" />
                {p}
              </li>
            ))}
          </ul>
          <Link href="/about" className="link-arrow mt-9" data-reveal>
            More about us <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        {/* Offset panel with arc-ringed figures (Pavilion panel + logo arc) */}
        <div className="relative" data-reveal>
          <div className="absolute -right-4 -top-6 bottom-10 left-10 rounded-[2rem] bg-surface md:-right-10" aria-hidden />
          <div className="dot-grid absolute -bottom-2 -left-2 h-28 w-40 opacity-70" aria-hidden />
          <div className="relative grid gap-5 p-2 sm:grid-cols-2 md:p-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-3xl p-7 shadow-card ring-1 ${
                  i === 0 ? "bg-brand text-white ring-brand sm:col-span-2" : "bg-white ring-line"
                }`}
              >
                <svg aria-hidden viewBox="0 0 120 120" className={`absolute -right-6 -top-6 size-32 ${i === 0 ? "text-white/15" : "text-sky/15"}`}>
                  <path d="M20 95 A50 50 0 1 1 100 92" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
                <p className={`font-display text-5xl font-extrabold leading-none md:text-6xl ${i === 0 ? "text-white" : "text-navy"}`}>
                  <CountUp value={s.value} />
                </p>
                <p className={`mt-3 text-sm font-medium ${i === 0 ? "text-white/80" : "text-muted"}`}>{s.label}</p>
                {i === 0 && (
                  <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-leaf" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
