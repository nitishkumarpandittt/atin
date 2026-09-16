"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CatalogueItem, Range } from "@/lib/data/catalogue";
import { matchesAllTerms } from "@/lib/utils/search";
import { ProductCard } from "@/components/site/ProductCard";
import { RangeIcon } from "@/components/primitives/RangeIcon";

export type CatalogueFilters = { q: string; range: string; form: string; newOnly: boolean };

type Props = { items: CatalogueItem[]; ranges: Range[]; initial: CatalogueFilters };

const PAGE = 24;

export function CatalogueBrowser({ items, ranges, initial }: Props) {
  // Initial filters come from the server (URL search params), so the first HTML already shows results.
  const [query, setQuery] = useState(initial.q);
  const [range, setRange] = useState(initial.range);
  const [form, setForm] = useState(initial.form);
  const [newOnly, setNewOnly] = useState(initial.newOnly);
  const [shown, setShown] = useState(PAGE);
  const resultsRef = useRef<HTMLDivElement>(null);
  const iconFor = useMemo(() => new Map(ranges.map((r) => [r.slug, r.icon])), [ranges]);

  // Arriving with a query from the home search: bring the results into view once.
  const arrivedWithQuery = useRef(Boolean(initial.q));
  useEffect(() => {
    if (arrivedWithQuery.current) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Keep filters in the URL without a navigation.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (range) next.set("range", range);
    if (form) next.set("form", form);
    if (newOnly) next.set("new", "1");
    const qs = next.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
  }, [query, range, form, newOnly]);

  const forms = useMemo(() => {
    const pool = range ? items.filter((i) => i.rangeSlug === range) : items;
    return [...new Set(pool.map((i) => i.dosageForm))].sort();
  }, [items, range]);

  const results = useMemo(
    () =>
      items.filter(
        (i) =>
          (!range || i.rangeSlug === range) &&
          (!form || i.dosageForm === form) &&
          (!newOnly || i.isNew) &&
          matchesAllTerms(`${i.brand} ${i.dosageForm} ${i.composition} ${i.pack} ${i.rangeName}`, query),
      ),
    [items, range, form, newOnly, query],
  );

  const hasNew = items.some((i) => i.isNew);
  const active = Boolean(query.trim() || range || form || newOnly);
  const reset = () => {
    setQuery("");
    setRange("");
    setForm("");
    setNewOnly(false);
    setShown(PAGE);
  };

  const segmentOptions = [{ slug: "", shortName: "All segments", icon: "", productCount: items.length }, ...ranges];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-line sm:p-5">
          <div className="flex min-h-9 items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <SlidersHorizontal aria-hidden className="size-4 text-brand" /> Filters
            </h2>
            {active && (
              <button type="button" onClick={reset} className="-mr-2 rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-surface">
                Clear all
              </button>
            )}
          </div>

          <label htmlFor="cat-q" className="mt-3 block text-sm font-semibold text-navy sm:mt-4">
            Search
          </label>
          <div className="relative mt-1.5">
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              id="cat-q"
              type="search"
              value={query}
              enterKeyHint="search"
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Brand, composition, pack"
              className="h-12 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-base focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 lg:h-11 lg:text-sm"
            />
          </div>

          <fieldset className="mt-4 min-w-0 sm:mt-5">
            <legend className="text-sm font-semibold text-navy">Segment</legend>
            {/* One swipeable row on phones and tablets; a vertical list in the desktop sidebar. */}
            <div className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {segmentOptions.map((r) => {
                const selected = range === r.slug;
                return (
                  <button
                    key={r.slug || "all"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setRange(r.slug);
                      setForm("");
                      setShown(PAGE);
                    }}
                    className={`flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-left text-sm transition lg:rounded-xl lg:px-3 lg:py-2 ${
                      selected ? "bg-brand font-semibold text-white" : "bg-surface text-ink hover:bg-sky-100 lg:bg-transparent"
                    }`}
                  >
                    {r.icon && <RangeIcon icon={r.icon} className={`hidden size-4 lg:block ${selected ? "" : "text-brand"}`} />}
                    <span className="lg:flex-1">{r.shortName}</span>
                    <span className={`text-xs ${selected ? "text-white/80" : "text-muted"}`}>{r.productCount}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label htmlFor="cat-form" className="block text-sm font-semibold text-navy">
                Dosage form
              </label>
              <select
                id="cat-form"
                value={form}
                onChange={(e) => {
                  setForm(e.target.value);
                  setShown(PAGE);
                }}
                className="mt-1.5 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 lg:h-11 lg:text-sm"
              >
                <option value="">All forms</option>
                {forms.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {hasNew && (
              <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium text-ink sm:self-end">
                <input type="checkbox" checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} className="size-5 accent-green" />
                New additions only
              </label>
            )}
          </div>
        </div>
      </aside>

      <div ref={resultsRef} className="min-w-0 scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted">
            Showing <strong className="text-navy">{Math.min(shown, results.length)}</strong> of{" "}
            <strong className="text-navy">{results.length}</strong> {results.length === 1 ? "product" : "products"}
          </p>
          {active && (
            <div className="flex flex-wrap gap-2">
              {query.trim() && <Chip label={`“${query.trim()}”`} onClear={() => setQuery("")} />}
              {range && <Chip label={ranges.find((r) => r.slug === range)?.shortName ?? range} onClear={() => setRange("")} />}
              {form && <Chip label={form} onClear={() => setForm("")} />}
              {newOnly && <Chip label="New" onClear={() => setNewOnly(false)} />}
            </div>
          )}
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-12 text-center sm:py-16">
            <p className="font-display text-xl font-bold text-navy">No products match these filters</p>
            <p className="mt-2 text-muted">Try a brand name or an ingredient, or clear the filters.</p>
            <button type="button" onClick={reset} className="btn btn-blue mt-6">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {results.slice(0, shown).map((p, i) => (
                <li key={p.slug}>
                  <ProductCard product={p} rangeName={range ? undefined : p.rangeName} icon={iconFor.get(p.rangeSlug) ?? ""} tone={i % 2 ? "green" : "blue"} />
                </li>
              ))}
            </ul>
            {shown < results.length && (
              <div className="mt-8 text-center sm:mt-10">
                <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn btn-blue w-full sm:w-auto">
                  Show more ({results.length - shown} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-sky-100 py-1 pl-3 pr-1 text-sm font-medium text-blue-800">
      <span className="truncate">{label}</span>
      <button type="button" onClick={onClear} aria-label={`Remove filter ${label}`} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white">
        <X aria-hidden className="size-4" />
      </button>
    </span>
  );
}
