import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RangeIcon } from "@/components/primitives/RangeIcon";

type Props = {
  product: { slug: string; brand: string; dosageForm: string; composition: string; pack: string; rangeSlug: string; isNew?: boolean };
  rangeName?: string;
  icon: string;
  tone?: "blue" | "green";
};

export function ProductCard({ product: p, rangeName, icon, tone = "blue" }: Props) {
  const green = tone === "green";
  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] bg-white p-4 shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift hover:ring-sky/40 sm:p-5">
      <div className="flex items-start gap-3 sm:justify-between">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-12 ${green ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand"}`}>
          <RangeIcon icon={icon} className="size-5 sm:size-6" />
        </span>
        {/* Phones: title sits beside the icon to keep cards short. */}
        <div className="min-w-0 flex-1 sm:hidden">
          <h3 className="text-base font-bold leading-snug">
            <Link href={`/products/${p.rangeSlug}/${p.slug}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
              {p.brand}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {p.dosageForm}
            {rangeName && <span className="font-semibold text-green"> · {rangeName}</span>}
          </p>
        </div>
        <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {p.isNew && <span className="rounded-full bg-green px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">New</span>}
          <span className="hidden rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-navy sm:inline">{p.dosageForm}</span>
        </span>
      </div>
      <div className="hidden sm:block">
        <h3 className="mt-4 text-lg font-bold leading-snug">
          <Link href={`/products/${p.rangeSlug}/${p.slug}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
            {p.brand}
          </Link>
        </h3>
        {rangeName && <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-green">{rangeName}</p>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted sm:line-clamp-3">{p.composition}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:pt-4">
        <p className="text-xs text-navy/75">{p.pack && <>Pack: {p.pack}</>}</p>
        <ArrowRight aria-hidden className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
      </div>
    </article>
  );
}
