import "server-only";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { getPublishedProducts, getRanges, type Product, type Range } from "@/lib/data/catalogue";
import { site } from "@/lib/site/config";
import { defaultShareImage, pageMeta } from "@/lib/site/seo";
import { productTitle } from "@/lib/utils/text";

// Search engine and tracking settings, plus per-page SEO overrides, all edited in the admin panel
// (Admin → SEO) and stored in site_settings: key "seo" for the settings, key "seo-pages" for overrides.

/* ------------------------------------------------------------------ settings */

// Every value lands in a <meta> tag or an inline tracking script, so each is validated to a strict shape.
export const GA4_ID = /^G-[A-Z0-9]{4,16}$/;
export const META_PIXEL_ID = /^\d{5,20}$/;
export const VERIFICATION_TOKEN = /^[A-Za-z0-9_-]{10,100}$/;

export const seoSettingsSchema = z.object({
  googleVerification: z.string().default(""),
  bingVerification: z.string().default(""),
  ga4Id: z.string().default(""),
  metaPixelId: z.string().default(""),
  /** Default share image for every page without its own (absolute URL or a site path such as /photos/share.jpg). */
  ogImage: z.string().default(""),
});
export type SeoSettings = z.infer<typeof seoSettingsSchema>;

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  const env = { googleVerification: process.env.GOOGLE_SITE_VERIFICATION?.trim() ?? "" };
  try {
    const [row] = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, "seo")).limit(1);
    const saved = row ? seoSettingsSchema.parse(JSON.parse(row.value)) : seoSettingsSchema.parse({});
    return { ...saved, googleVerification: saved.googleVerification || env.googleVerification };
  } catch {
    return seoSettingsSchema.parse(env);
  }
});

/* ------------------------------------------------------------------ per-page overrides */

export const pageOverrideSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  ogImage: z.string().default(""),
  noIndex: z.boolean().default(false),
});
export type PageOverride = z.infer<typeof pageOverrideSchema>;

export const getPageOverrides = cache(async (): Promise<Record<string, PageOverride>> => {
  try {
    const [row] = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, "seo-pages")).limit(1);
    return row ? z.record(z.string(), pageOverrideSchema).parse(JSON.parse(row.value)) : {};
  } catch {
    return {};
  }
});

/* ------------------------------------------------------------------ page registry and defaults */

export type SeoDefaults = {
  path: string;
  /** Page title before the " | Atin HealthCare" suffix; `absolute` titles are used as they are. */
  title: string;
  absolute?: boolean;
  description: string;
  /** Routes with their own opengraph-image file (products) keep it unless an override image is set. */
  ownImage?: boolean;
};

export const staticPages: Record<string, SeoDefaults & { label: string }> = {
  "/": { path: "/", label: "Home", title: `${site.name} | Pharmaceutical Marketing & Distribution`, absolute: true, description: site.description },
  "/about": { path: "/about", label: "About us", title: "About us", description: "Atin HealthCare Pvt Ltd is a pharmaceutical marketing and distribution company serving the pharma trade across segments." },
  "/products": { path: "/products", label: "All products", title: "Products", description: "Browse the Atin HealthCare product catalogue by segment, dosage form, brand or composition." },
  "/products/new-additions": { path: "/products/new-additions", label: "New additions", title: "New additions", description: "Recently added products in the Atin HealthCare catalogue." },
  "/quality-certifications": { path: "/quality-certifications", label: "Quality & certifications", title: "Quality & certifications", description: "How Atin HealthCare handles product information and documentation, and how to request licences and certificates." },
  "/contact": { path: "/contact", label: "Contact", title: "Contact", description: "Send a trade enquiry to Atin HealthCare or request a call back from our team." },
  "/divisions": { path: "/divisions", label: "Other divisions", title: "Other divisions", description: `The pharmaceutical companies in the same group as ${site.name}, each with its own portfolio and website.` },
  "/disclaimer": { path: "/disclaimer", label: "Disclaimer", title: "Disclaimer", description: "Terms under which product information is published on the Atin HealthCare website." },
};

export const rangeSeoDefaults = (range: Range): SeoDefaults => ({
  path: `/products/${range.slug}`,
  title: range.shortName,
  description: `${range.shortName} from Atin HealthCare: ${range.productCount} products including ${range.dosageForms.slice(0, 4).join(", ").toLowerCase()}.`,
});

export const productSeoDefaults = (p: Product): SeoDefaults => ({
  path: `/products/${p.rangeSlug}/${p.slug}`,
  title: productTitle(p.brand, p.dosageForm),
  description: `${p.brand} (${p.dosageForm}). Composition: ${p.composition}.${p.pack ? ` Pack: ${p.pack}.` : ""}`,
  ownImage: true,
});

export type SeoPageEntry = SeoDefaults & { label: string; group: "Pages" | "Segments" | "Products" };

/** Every public page whose SEO can be managed, with its built-in defaults. */
export async function listSeoPages(): Promise<SeoPageEntry[]> {
  const [ranges, products] = await Promise.all([getRanges(), getPublishedProducts()]);
  return [
    ...Object.values(staticPages).map((p) => ({ ...p, group: "Pages" as const })),
    ...ranges.map((r) => ({ ...rangeSeoDefaults(r), label: r.shortName, group: "Segments" as const })),
    ...products.map((p) => ({ ...productSeoDefaults(p), label: productTitle(p.brand, p.dosageForm), group: "Products" as const })),
  ];
}

/* ------------------------------------------------------------------ metadata */

/** Turns a stored image value (absolute URL or site path) into an Open Graph image entry. */
const shareImage = (url: string, alt: string) => ({ url, width: 1200, height: 630, alt });

/**
 * Page metadata with admin overrides applied: an override title is used exactly as typed (no suffix),
 * an override image beats the page's own, and "hide from search engines" adds noindex.
 */
export async function seoMeta(defaults: SeoDefaults): Promise<Metadata> {
  const [overrides, settings] = await Promise.all([getPageOverrides(), getSeoSettings()]);
  const o = overrides[defaults.path];
  const description = o?.description || defaults.description;
  const customTitle = o?.title || (defaults.absolute ? defaults.title : "");
  const image = o?.ogImage
    ? shareImage(o.ogImage, customTitle || defaults.title)
    : defaults.ownImage
      ? null
      : settings.ogImage
        ? shareImage(settings.ogImage, defaultShareImage.alt)
        : undefined;

  const meta = pageMeta({
    title: defaults.title,
    description,
    path: defaults.path,
    image,
    ...(o?.noIndex && { robots: { index: false, follow: true } }),
  });
  if (customTitle) {
    meta.title = { absolute: customTitle };
    if (meta.openGraph) meta.openGraph.title = customTitle;
    if (meta.twitter) meta.twitter.title = customTitle;
  }
  return meta;
}

/** Paths an admin has hidden from search engines; left out of the sitemap. */
export async function noIndexPaths(): Promise<Set<string>> {
  const overrides = await getPageOverrides();
  return new Set(Object.entries(overrides).filter(([, o]) => o.noIndex).map(([path]) => path));
}
