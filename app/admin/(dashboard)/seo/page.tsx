import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { SeoSettingsForm } from "@/components/admin/SeoSettingsForm";
import { requireRole } from "@/lib/auth/dal";
import { getPageOverrides, getSeoSettings, listSeoPages } from "@/lib/data/seo";
import { site } from "@/lib/site/config";

export const metadata: Metadata = { title: "SEO" };

const GROUPS = ["Pages", "Segments", "Products"] as const;

export default async function SeoPage({ searchParams }: PageProps<"/admin/seo">) {
  const session = await requireRole("editor");
  const [settings, overrides, pages, sp] = await Promise.all([getSeoSettings(), getPageOverrides(), listSeoPages(), searchParams]);
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const shown = q ? pages.filter((p) => `${p.label} ${p.path}`.toLowerCase().includes(q)) : pages;
  const customised = Object.keys(overrides).length;

  return (
    <>
      <PageHeader title="SEO" description="Search engine verification, analytics tracking and each page's title, description and share image." />
      <div className="space-y-6">
        <SeoSettingsForm values={settings} canEdit={session.role === "admin"} siteUrl={site.url} />

        <Card title="Page SEO" description={`${pages.length} pages · ${customised} customised. Pages without changes use an automatic title and description.`}>
          <form className="flex gap-2 border-b border-line p-4 sm:px-5" role="search">
            <label htmlFor="seo-q" className="sr-only">
              Search pages
            </label>
            <input id="seo-q" name="q" defaultValue={q} placeholder="Search pages, segments or products" className="admin-input" />
            <button type="submit" className="admin-btn admin-btn-secondary">
              Search
            </button>
          </form>
          {GROUPS.map((group) => {
            const rows = shown.filter((p) => p.group === group);
            if (!rows.length) return null;
            return (
              <div key={group}>
                <p className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">
                  {group} ({rows.length})
                </p>
                <ul className="divide-y divide-line">
                  {rows.map((p) => {
                    const o = overrides[p.path];
                    return (
                      <li key={p.path}>
                        <Link href={`/admin/seo/page?path=${encodeURIComponent(p.path)}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-slate-50 sm:px-5">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-ink">{p.label}</span>
                            <span className="block truncate text-xs text-muted">{o?.title || (p.absolute ? p.title : `${p.title} | ${site.name}`)}</span>
                          </span>
                          <span className="flex gap-1.5">
                            {o?.noIndex && <Badge tone="amber">Hidden from search</Badge>}
                            {o && (o.title || o.description || o.ogImage) && <Badge tone="green">Customised</Badge>}
                          </span>
                          <span className="text-xs text-muted">{p.path}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {!shown.length && <p className="p-5 text-sm text-muted">No pages match “{q}”.</p>}
        </Card>
      </div>
    </>
  );
}
