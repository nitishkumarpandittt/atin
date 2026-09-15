import Link from "next/link";
import { ArrowRight, Building2, Hospital, Store, Truck } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";

const audiences = [
  { icon: Truck, title: "Distributors & stockists", text: "Regional supply partners sourcing across multiple segments from one company." },
  { icon: Store, title: "Retail chemists", text: "Pharmacies looking for a broad, clearly documented product list." },
  { icon: Hospital, title: "Hospitals & clinics", text: "Purchase teams needing injectables, topicals and routine formats." },
  { icon: Building2, title: "Institutional buyers", text: "Organisations that require product documentation and a single trade contact." },
];

export function Audiences() {
  return (
    <section aria-labelledby="audiences-title" className="relative overflow-hidden bg-brand py-24 md:py-32">
      <div className="hex-pattern absolute inset-0" aria-hidden />
      {/* Curved edges echoing the hero sweep */}
      <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full fill-surface md:h-16">
        <path d="M0 0 H1440 V10 C 1080 70, 460 80, 0 20 Z" />
      </svg>
      <div className="absolute -right-32 bottom-[-12rem] size-[30rem] rounded-full border-[16px] border-white/5" aria-hidden />

      <div className="container-site relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading id="audiences-title" tone="light" eyebrow="Who we work with" title="Built around the needs of trade partners" />
          <div data-reveal>
            <p className="text-white/80 md:text-lg">
              Whether you run a distribution network or a single counter, we make it simple to source, enquire and reorder.
            </p>
            <Link href="/contact" className="btn btn-white mt-6">
              Become a distribution partner <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="rounded-[var(--radius-card)] bg-white/[0.07] p-7 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/[0.12]"
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-white text-brand">
                <Icon aria-hidden className="size-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-bold !text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
