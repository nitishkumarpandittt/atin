import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus, Search } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Pagination } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { deleteProduct, duplicateProduct } from "@/lib/admin/actions/products";
import { listProducts, listRangesWithCounts, type ProductFilters } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";
import { uploadUrl } from "@/lib/uploads/url";

export const metadata: Metadata = { title: "Products" };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function ProductsAdminPage({ searchParams }: PageProps<"/admin/products">) {
  await requireStaff();
  const sp = await searchParams;
  const filters: ProductFilters = {
    q: one(sp.q).slice(0, 80),
    range: one(sp.range),
    status: (["published", "hidden", "review", "new"].includes(one(sp.status)) ? one(sp.status) : "") as ProductFilters["status"],
    mrp: (["set", "missing"].includes(one(sp.mrp)) ? one(sp.mrp) : "") as ProductFilters["mrp"],
    images: one(sp.images) === "none" ? "none" : "",
    sort: (["updated", "name", "mrp"].includes(one(sp.sort)) ? one(sp.sort) : "catalogue") as ProductFilters["sort"],
    page: Number(one(sp.page)) || 1,
  };
  const [{ rows, total, page, pages }, ranges] = await Promise.all([listProducts(filters), listRangesWithCounts()]);

  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, page: p })) if (v && !(k === "sort" && v === "catalogue") && !(k === "page" && v === 1)) qs.set(k, String(v));
    return `/admin/products${qs.size ? `?${qs}` : ""}`;
  };
  const statusChips = [
    { value: "", label: "All" },
    { value: "published", label: "Published" },
    { value: "hidden", label: "Hidden" },
    { value: "review", label: "Needs review" },
    { value: "new", label: "New additions" },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description={`${total} ${total === 1 ? "product" : "products"} match these filters.`}
        actions={
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            <Plus aria-hidden className="size-4" /> Add product
          </Link>
        }
      />
      {one(sp.deleted) && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">Product deleted.</p>}

      <Card className="mb-4">
        <form method="get" className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] xl:items-end">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <label htmlFor="q" className="mb-1 block text-sm font-medium">Search</label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Brand, composition, pack, price note" className="admin-input pl-9" />
            </div>
          </div>
          <div>
            <label htmlFor="range" className="mb-1 block text-sm font-medium">Range</label>
            <select id="range" name="range" defaultValue={filters.range} className="admin-input">
              <option value="">All ranges</option>
              {ranges.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.shortName} ({r.productCount})
                </option>
              ))}
              <option value="none">No range</option>
            </select>
          </div>
          <div>
            <label htmlFor="mrp" className="mb-1 block text-sm font-medium">MRP</label>
            <select id="mrp" name="mrp" defaultValue={filters.mrp} className="admin-input">
              <option value="">Any</option>
              <option value="set">MRP or note set</option>
              <option value="missing">No MRP</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="mb-1 block text-sm font-medium">Sort</label>
            <select id="sort" name="sort" defaultValue={filters.sort} className="admin-input">
              <option value="catalogue">Catalogue order</option>
              <option value="updated">Recently updated</option>
              <option value="name">Brand A–Z</option>
              <option value="mrp">MRP low–high</option>
            </select>
          </div>
          {filters.status && <input type="hidden" name="status" value={filters.status} />}
          {filters.images && <input type="hidden" name="images" value={filters.images} />}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <button type="submit" className="admin-btn admin-btn-primary flex-1 xl:flex-none">Apply</button>
            <Link href="/admin/products" className="admin-btn admin-btn-secondary">Reset</Link>
          </div>
        </form>
        <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3 sm:px-5">
          {statusChips.map((c) => {
            const qs = new URLSearchParams();
            if (filters.q) qs.set("q", filters.q);
            if (filters.range) qs.set("range", filters.range);
            if (c.value) qs.set("status", c.value);
            const active = (filters.status ?? "") === c.value && !filters.images;
            return (
              <Link
                key={c.label}
                href={`/admin/products${qs.size ? `?${qs}` : ""}`}
                aria-current={active ? "true" : undefined}
                className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-medium ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {c.label}
              </Link>
            );
          })}
          {filters.images && <Badge tone="amber">Without images</Badge>}
        </div>
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No products match" text="Try a different search or reset the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Range</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Pack</th>
                  <th scope="col" className="px-4 py-3 font-semibold">MRP</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-line">
                          {p.image ? <Image src={uploadUrl(p.image)} alt="" fill sizes="44px" className="object-cover" /> : null}
                        </span>
                        <span className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="font-semibold text-ink hover:text-blue-700 hover:underline">
                            {p.brand}
                          </Link>
                          <span className="block text-xs text-muted">{p.dosageForm}</span>
                          <span className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted">{p.composition}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.rangeName ?? <Badge tone="red">None</Badge>}</td>
                    <td className="px-4 py-3 text-muted">{p.pack || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.mrp != null ? `₹${p.mrp.toFixed(2)}` : p.mrpNote ? <Badge tone="blue">{p.mrpNote}</Badge> : <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        {p.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
                        {p.reviewNote && !p.isPublished && <Badge tone="amber">Review</Badge>}
                        {p.isNew && <Badge tone="blue">New</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex justify-end gap-1">
                        <Link href={`/admin/products/${p.id}`} className="admin-btn admin-btn-secondary">Edit</Link>
                        {p.isPublished && p.rangeSlug && (
                          <Link href={`/products/${p.rangeSlug}/${p.slug}`} target="_blank" className="admin-btn admin-btn-ghost" title="View on website">
                            <ExternalLink aria-hidden className="size-4" />
                            <span className="sr-only">View on website</span>
                          </Link>
                        )}
                        <ActionButton action={duplicateProduct} fields={{ id: p.id }} variant="ghost" title="Duplicate as a hidden copy">
                          Duplicate
                        </ActionButton>
                        <ActionButton action={deleteProduct} fields={{ id: p.id }} variant="danger" confirm={{ title: `Delete ${p.brand}?`, message: "The product and all its images are removed from the website. This cannot be undone.", confirmLabel: "Delete product" }}>
                          Delete
                        </ActionButton>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} hrefFor={hrefFor} />
      </Card>
    </>
  );
}
