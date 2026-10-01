import type { MetadataRoute } from "next";
import { getPublishedProducts, getRanges } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ranges, products] = await Promise.all([getRanges(), getPublishedProducts()]);
  const url = (path: string) => `${site.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/quality-certifications"), changeFrequency: "monthly", priority: 0.5 },
    { url: url("/products/new-additions"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/divisions"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/disclaimer"), changeFrequency: "yearly", priority: 0.2 },
    ...ranges.map((r) => ({ url: url(`/products/${r.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: url(`/products/${p.rangeSlug}/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
