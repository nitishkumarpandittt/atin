import type { MetadataRoute } from "next";
import { getMainImages, getPublishedProducts, getRanges } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ranges, products, images] = await Promise.all([getRanges(), getPublishedProducts(), getMainImages()]);
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
}
