import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { requireRole } from "@/lib/auth/dal";
import { getPageOverrides, listSeoPages } from "@/lib/data/seo";
import { site } from "@/lib/site/config";

export const metadata: Metadata = { title: "Page SEO" };

export default async function PageSeoEditor({ searchParams }: PageProps<"/admin/seo/page">) {
  await requireRole("editor");
  const [sp, pages, overrides] = await Promise.all([searchParams, listSeoPages(), getPageOverrides()]);
  const path = typeof sp.path === "string" ? sp.path : "";
  const page = pages.find((p) => p.path === path);
  if (!page) notFound();
  const o = overrides[path];
  const values = { title: o?.title ?? "", description: o?.description ?? "", ogImage: o?.ogImage ?? "", noIndex: o?.noIndex ?? false };

  return (
    <>
      <PageHeader title={page.label} description={`${page.group === "Pages" ? "Page" : page.group.slice(0, -1)} · ${path}`} back={{ href: "/admin/seo", label: "All pages" }} />
      {/* key: remount after saving or resetting so the fields show what is stored. */}
      <PageSeoForm
        key={JSON.stringify(values)}
        path={path}
        siteName={site.name}
        siteUrl={site.url}
        defaults={{ title: page.absolute ? page.title : `${page.title} | ${site.name}`, description: page.description }}
        values={values}
        hasOverride={Boolean(o)}
      />
    </>
  );
}
