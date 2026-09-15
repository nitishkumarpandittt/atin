import type { Range } from "@/lib/data/catalogue";
import { RangeIcon } from "@/components/primitives/RangeIcon";

export function SegmentMarquee({ ranges }: { ranges: Range[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {ranges.map((r) => (
        <li key={r.slug} className="flex items-center gap-3 whitespace-nowrap font-display text-lg font-bold text-navy/35 md:text-xl">
          <RangeIcon icon={r.icon} className="size-6 text-sky/60" />
          {r.shortName}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Product segments" className="relative mt-14 overflow-hidden py-6 md:mt-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white" aria-hidden />
      <div className="flex w-max motion-safe:animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
