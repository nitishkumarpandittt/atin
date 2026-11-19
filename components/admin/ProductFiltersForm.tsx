"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRef } from "react";

type Filters = {
  q: string;
  range: string;
  mrp: string;
  sort: string;
  status: string;
  images: string;
};

type RangeOption = { id: number; slug: string; shortName: string; productCount: number };

export function ProductFiltersForm({ filters, ranges }: { filters: Filters; ranges: RangeOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submit = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action="/admin/products" method="get" className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
      <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
        <label htmlFor="q" className="mb-1 block text-sm font-medium">Search</label>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Brand, composition, pack, price note"
            className="admin-input pl-9"
            onChange={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(submit, 300);
            }}
          />
        </div>
      </div>
      <div>
        <label htmlFor="range" className="mb-1 block text-sm font-medium">Range</label>
        <select id="range" name="range" defaultValue={filters.range} className="admin-input" onChange={submit}>
          <option value="">All ranges</option>
          {ranges.map((r) => <option key={r.id} value={r.slug}>{r.shortName} ({r.productCount})</option>)}
          <option value="none">No range</option>
        </select>
      </div>
      <div>
        <label htmlFor="mrp" className="mb-1 block text-sm font-medium">MRP</label>
        <select id="mrp" name="mrp" defaultValue={filters.mrp} className="admin-input" onChange={submit}>
          <option value="">Any</option>
          <option value="set">MRP or note set</option>
          <option value="missing">No MRP</option>
        </select>
      </div>
      <div>
        <label htmlFor="sort" className="mb-1 block text-sm font-medium">Sort</label>
        <select id="sort" name="sort" defaultValue={filters.sort} className="admin-input" onChange={submit}>
          <option value="catalogue">Catalogue order</option>
          <option value="updated">Recently updated</option>
          <option value="name">Brand A-Z</option>
          <option value="mrp">MRP low-high</option>
        </select>
      </div>
      {filters.status && <input type="hidden" name="status" value={filters.status} />}
      {filters.images && <input type="hidden" name="images" value={filters.images} />}
      <input type="hidden" name="page" value="1" />
      <div className="flex justify-end xl:col-span-1">
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">Reset</Link>
      </div>
    </form>
  );
}
