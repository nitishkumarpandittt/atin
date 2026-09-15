"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";

type Suggestion = {
  slug: string;
  brand: string;
  dosageForm: string;
  composition: string;
  rangeSlug: string;
  rangeName: string;
};

type Props = { ranges: { slug: string; shortName: string }[] };

export function ProductSearch({ ranges }: Props) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("");
  const [data, setData] = useState<{ key: string; total: number; results: Suggestion[] }>({ key: "", total: 0, results: [] });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const q = query.trim();
  const key = q.length >= 2 ? `${q}|${range}` : "";
  const loading = key !== "" && data.key !== key;
  const fresh = key !== "" && data.key === key;
  const results = fresh ? data.results : [];
  const total = fresh ? data.total : 0;

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q });
        if (range) params.set("range", range);
        const res = await fetch(`/api/search?${params}`, { signal: ctrl.signal });
        const json = (await res.json()) as { total: number; results: Suggestion[] };
        setData({ key, ...json });
        setActive(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setData({ key, total: 0, results: [] });
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [key, q, range]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const allResultsHref = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (range) params.set("range", range);
    const s = params.toString();
    return `/products${s ? `?${s}` : ""}`;
  };

  // Options: each suggestion, then "View all" when there are matches.
  const optionCount = results.length + (total > 0 ? 1 : 0);
  const showList = open && q.length >= 2;

  const go = (index: number) => {
    if (index >= 0 && index < results.length) {
      const r = results[index];
      router.push(`/products/${r.rangeSlug}/${r.slug}`);
    } else {
      router.push(allResultsHref());
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (optionCount ? (a + 1) % optionCount : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (optionCount ? (a <= 0 ? optionCount - 1 : a - 1) : -1));
    } else if (e.key === "Enter" && showList && active >= 0) {
      e.preventDefault();
      go(active);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <form
        role="search"
        aria-label="Find a product"
        onSubmit={(e) => {
          e.preventDefault();
          go(-1);
        }}
        className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center"
      >
        <div className="relative">
          <label htmlFor={`${id}-q`} className="sr-only">
            Brand name or composition
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            id={`${id}-q`}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Search by brand or composition, e.g. Cefixime"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="h-14 w-full rounded-xl border border-line bg-surface pl-12 pr-10 text-[0.95rem] text-ink placeholder:text-muted/80 focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
          />
          {loading && <Loader2 aria-hidden className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted" />}
        </div>
        <div>
          <label htmlFor={`${id}-range`} className="sr-only">
            Product segment
          </label>
          <select
            id={`${id}-range`}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-14 w-full rounded-xl border border-line bg-surface px-4 text-[0.95rem] text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 md:w-52"
          >
            <option value="">All segments</option>
            {ranges.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.shortName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-green h-14 px-7">
          Search
        </button>
      </form>

      <div aria-live="polite" className="sr-only">
        {showList && !loading ? (total ? `${total} products found` : "No products found") : ""}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[22rem] overflow-y-auto rounded-2xl bg-white p-2 shadow-lift ring-1 ring-line"
        >
          {results.map((r, i) => (
            <li
              key={r.slug}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={active === i}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => go(i)}
              onPointerMove={() => setActive(i)}
              className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl px-4 py-3 ${active === i ? "bg-surface" : ""}`}
            >
              <span className="min-w-0">
                <span className="block font-semibold text-navy">
                  {r.brand} <span className="font-normal text-muted">· {r.dosageForm}</span>
                </span>
                <span className="block truncate text-sm text-muted">{r.composition}</span>
              </span>
              <span className="mt-0.5 hidden shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-blue-800 sm:block">
                {r.rangeName}
              </span>
            </li>
          ))}
          {total > 0 ? (
            <li
              id={`${id}-opt-${results.length}`}
              role="option"
              aria-selected={active === results.length}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => go(-1)}
              onPointerMove={() => setActive(results.length)}
              className={`mt-1 flex cursor-pointer items-center justify-between rounded-xl border-t border-line px-4 py-3 font-semibold text-brand ${
                active === results.length ? "bg-surface" : ""
              }`}
            >
              View all {total} results
              <ArrowRight aria-hidden className="size-4" />
            </li>
          ) : (
            !loading && <li className="px-4 py-3 text-sm text-muted">No products match “{q}”. Try a brand or an ingredient name.</li>
          )}
        </ul>
      )}
    </div>
  );
}
