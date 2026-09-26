import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RangeIcon } from "@/components/primitives/RangeIcon";

type Props = {
  product: { slug: string; brand: string; dosageForm: string; composition: string; pack: string; rangeSlug: string; isNew?: boolean; image?: string };
  rangeName?: string;
  icon: string;
  tone?: "blue" | "green";
};

export function ProductCard({ product: p, rangeName, icon, tone = "blue" }: Props) {
  const tile = tone === "green" ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand";
  const href = `/products/${p.rangeSlug}/${p.slug}`;
  const newBadge = p.isNew && <span className="rounded-full bg-green px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">New</span>;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift hover:ring-sky/40">
      {p.image && (
        /* Tablet and up: pack shot on a light stage. Multiply blends the shot's white background into the tint. */
        <div className="relative hidden aspect-[4/3] overflow-hidden border-b border-line bg-surface sm:block">
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 35vw, 50vw"
            className="object-contain p-5 mix-blend-multiply transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-end gap-1.5">
            {newBadge}
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-line">{p.dosageForm}</span>
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* With a pack shot this row is phone-only: the banner above carries the badges from sm up. */}
        <div className={`flex gap-3 ${p.image ? "items-center sm:hidden" : "items-start sm:justify-between"}`}>
          {p.image ? (
            /* Phones: the pack shot stands in for the icon tile so collapsible lists stay short. */
            <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-line">
              <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1 mix-blend-multiply" />
            </span>
          ) : (
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-12 ${tile}`}>
              <RangeIcon icon={icon} className="size-5 sm:size-6" />
            </span>
          )}
          {/* Phones: title sits beside the tile to keep cards short. */}
          <div className="min-w-0 flex-1 sm:hidden">
            <h3 className="wrap-anywhere text-base font-bold leading-snug">
              <Link href={href} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
                {p.brand}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs font-medium text-muted">
              {p.dosageForm}
              {rangeName && <span className="font-semibold text-green"> · {rangeName}</span>}
            </p>
          </div>
          {/* Badges may shrink to the widest pill so they stack instead of poking out of narrow cards. */}
          <span className="flex flex-wrap justify-end gap-1.5">
            {newBadge}
            {!p.image && <span className="hidden rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-navy sm:inline">{p.dosageForm}</span>}
          </span>
        </div>
        <div className="hidden sm:block">
          {p.image && (
            /* Echoes the segment cards: the range tile straddles the banner edge (lifted by its own height above the p-5 padding). */
            <span className={`relative -mt-10 grid size-10 place-items-center rounded-xl shadow-card ring-4 ring-white ${tile}`}>
              <RangeIcon icon={icon} className="size-5" />
            </span>
          )}
          <h3 className={`wrap-anywhere text-lg font-bold leading-snug ${p.image ? "mt-3" : "mt-4"}`}>
            <Link href={href} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
              {p.brand}
            </Link>
          </h3>
          {rangeName && <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-green">{rangeName}</p>}
        </div>
        <p className="mt-2 line-clamp-2 wrap-anywhere text-sm leading-relaxed text-muted sm:line-clamp-3">{p.composition}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:pt-4">
          <p className="min-w-0 wrap-anywhere text-xs text-navy/75">{p.pack && <>Pack: {p.pack}</>}</p>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
}
