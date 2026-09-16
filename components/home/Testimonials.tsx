import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";

type Item = { id: number; quote: string; name: string; role: string; organisation: string };

/** Trade testimonials. Hidden entirely until at least one has permission and is published. */
export function Testimonials({ items }: { items: Item[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="testimonials-title" className="bg-surface py-14 md:py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading id="testimonials-title" align="center" eyebrow="Trade partners" title="What our partners say" />
        <ul className={`mx-auto mt-10 grid gap-4 sm:gap-6 md:mt-14 ${items.length === 1 ? "max-w-2xl" : items.length === 2 ? "max-w-5xl md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {items.slice(0, 6).map((t, i) => (
            <li key={t.id} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}>
              <figure className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
                <Quote aria-hidden className="size-8 text-leaf" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">
                    {t.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">{t.name}</span>
                    <span className="block text-sm text-muted">{[t.role, t.organisation].filter(Boolean).join(", ")}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
