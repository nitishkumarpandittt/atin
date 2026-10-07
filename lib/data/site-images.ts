import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { photo, type Photo } from "@/lib/site/photos";
import { uploadUrl } from "@/lib/uploads/url";

// Every photo on the public pages, by placement. Each defaults to a stock photo slot and can be
// replaced in Admin → Site images; the uploads live in site_settings under key "site-images".
// Segment photos are not listed here: they are managed per segment in Admin → Ranges.

export type ImagePlacement = { key: string; page: string; label: string; stock: string; hint?: string };

export const imagePlacements: ImagePlacement[] = [
  { key: "home-hero", page: "Home", label: "Hero (beside the headline)", stock: "hero", hint: "Tall crop: keep the subject near the centre." },
  { key: "home-about", page: "Home", label: "About block", stock: "chemist-counter" },
  { key: "home-audiences", page: "Home", label: "\"Who we work with\" band background", stock: "hospital-corridor" },
  { key: "home-why", page: "Home", label: "\"Why Atin\" photo", stock: "warehouse" },
  { key: "home-enquiry", page: "Home", label: "Enquiry band background", stock: "team" },
  { key: "about-hero", page: "About", label: "Page banner", stock: "team" },
  { key: "about-profile", page: "About", label: "Company profile (large photo)", stock: "warehouse" },
  { key: "about-profile-small", page: "About", label: "Company profile (small photo)", stock: "chemist-counter" },
  { key: "about-band", page: "About", label: "Bottom call-to-action background", stock: "warehouse" },
  { key: "products-hero", page: "Products", label: "All products banner", stock: "warehouse" },
  { key: "new-additions-hero", page: "Products", label: "New additions banner", stock: "chemist-counter" },
  { key: "quality-hero", page: "Quality & certifications", label: "Page banner", stock: "lab-quality" },
  { key: "quality-side", page: "Quality & certifications", label: "Photo beside \"Our approach\"", stock: "blog-2" },
  { key: "contact-hero", page: "Contact", label: "Page banner", stock: "contact" },
  { key: "contact-panel", page: "Contact", label: "Contact details panel background", stock: "contact" },
  { key: "divisions-hero", page: "Other divisions", label: "Page banner", stock: "team" },
  { key: "not-found-hero", page: "Page not found (404)", label: "Page banner", stock: "blog-2" },
];

export const placementKeys = new Set(imagePlacements.map((p) => p.key));

export const POSITIONS = ["center", "top", "bottom", "left", "right"] as const;

export const siteImageSchema = z.object({
  filePath: z.string(),
  alt: z.string().default(""),
  position: z.enum(POSITIONS).default("center"),
});
export type SiteImage = z.infer<typeof siteImageSchema>;

export const getSiteImages = cache(async (): Promise<Record<string, SiteImage>> => {
  try {
    const [row] = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, "site-images")).limit(1);
    return row ? z.record(z.string(), siteImageSchema).parse(JSON.parse(row.value)) : {};
  } catch {
    return {};
  }
});

/** The photo for a placement: the admin's upload when there is one, otherwise the stock photo. */
export async function sitePhoto(key: string): Promise<Photo | undefined> {
  const placement = imagePlacements.find((p) => p.key === key);
  if (!placement) throw new Error(`Unknown image placement "${key}"`);
  const custom = (await getSiteImages())[key];
  const stock = photo(placement.stock);
  if (!custom) return stock;
  return { src: uploadUrl(custom.filePath), alt: custom.alt || stock?.alt || placement.label, position: custom.position };
}
