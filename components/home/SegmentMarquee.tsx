import type { Range } from "@/lib/data/catalogue";
import { RangeIcon } from "@/components/primitives/RangeIcon";

export function SegmentMarquee({ ranges }: { ranges: Range[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12">
      {ranges.map((r) => (
        <li key={r.slug} className="flex items-center gap-3 whitespace-nowrap font-display text-base font-bold text-navy/35 sm:text-lg md:text-xl">
          <RangeIcon icon={r.icon} className="size-6 text-sky/60" />
          {r.shortName}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Product segments" className="relative mt-8 overflow-hidden py-5 md:mt-14 md:py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white sm:w-24" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white sm:w-24" aria-hidden />
      <div className="flex w-max motion-safe:animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
