import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Hospital, Store, Truck } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import type { Photo } from "@/lib/site/photos";

const audiences = [
  { icon: Truck, title: "Distributors & stockists", text: "Regional supply partners sourcing across multiple segments from one company." },
  { icon: Store, title: "Retail chemists", text: "Pharmacies looking for a broad, clearly documented product list." },
  { icon: Hospital, title: "Hospitals & clinics", text: "Purchase teams needing injectables, topicals and routine formats." },
  { icon: Building2, title: "Institutional buyers", text: "Organisations that require product documentation and a single trade contact." },
];

export function Audiences({ photo }: { photo: Photo }) {
  return (
    <section aria-labelledby="audiences-title" className="relative isolate overflow-hidden bg-brand py-16 md:py-24 lg:py-32">
      <Image src={photo.src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: photo.position }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/90 via-brand/75 to-navy/85" />
      <div className="hex-pattern absolute inset-0" aria-hidden />
      {/* Curved edges echoing the hero sweep */}
      <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full fill-surface md:h-16">
        <path d="M0 0 H1440 V10 C 1080 70, 460 80, 0 20 Z" />
      </svg>
      <div className="absolute -right-32 bottom-[-12rem] size-[30rem] rounded-full border-[16px] border-white/5" aria-hidden />

      <div className="container-site relative">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
          <SectionHeading id="audiences-title" tone="light" eyebrow="Who we work with" title="Built around the needs of trade partners" />
          <div data-reveal>
            <p className="text-white/80 md:text-lg">
              Whether you run a distribution network or a single counter, we make it simple to source, enquire and reorder.
            </p>
            <Link href="/contact" className="btn btn-white mt-6 w-full whitespace-normal text-center leading-tight sm:w-auto">
              Become a distribution partner <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-5 md:mt-14 xl:grid-cols-4">
          {audiences.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/[0.12] sm:block sm:rounded-[var(--radius-card)] sm:p-7"
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand sm:size-12">
                <Icon aria-hidden className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="text-base font-bold !text-white sm:mt-5 sm:text-lg">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75 sm:mt-2">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
