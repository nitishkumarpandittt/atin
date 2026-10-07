import type { MetadataRoute } from "next";
import { getMainImages, getPublishedProducts, getRanges } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";
import { noIndexPaths } from "@/lib/data/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ranges, products, images, hidden] = await Promise.all([getRanges(), getPublishedProducts(), getMainImages(), noIndexPaths()]);
  const url = (path: string) => `${site.url}${path}`;

  const entries: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/quality-certifications"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/products/new-additions"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/divisions"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/disclaimer"), changeFrequency: "yearly", priority: 0.2 },
    ...ranges.map((r) => ({ url: url(`/products/${r.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => {
      const img = images.get(p.id);
      return {
        url: url(`/products/${p.rangeSlug}/${p.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(img && { images: [img.src.startsWith("http") ? img.src : url(img.src)] }),
      };
    }),
  ];
  // Pages an admin hid from search engines (Admin → SEO) are left out.
  return entries.filter((e) => !hidden.has(e.url.slice(site.url.length) || "/"));
}
