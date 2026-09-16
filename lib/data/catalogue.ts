import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db, schema } from "@/lib/db";
import { uploadUrl } from "@/lib/uploads/url";
import { matchesAllTerms, normaliseSearch } from "@/lib/utils/search";

const { products, ranges, productImages } = schema;

export type Range = {
  slug: string;
  shortName: string;
  icon: string;
  productCount: number;
  dosageForms: string[];
};

export type ProductImage = { src: string; alt: string; width: number; height: number };

export type Product = {
  id: number;
  slug: string;
  brand: string;
  dosageForm: string;
  composition: string;
  pack: string;
  rangeSlug: string;
  sortOrder: number;
  isNew: boolean;
  mrp: number | null;
  mrpNote: string | null;
  prescribingSpecialities: string | null;
};

export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      brand: products.brand,
      dosageForm: products.dosageForm,
      composition: products.composition,
      pack: products.pack,
      rangeSlug: ranges.slug,
      sortOrder: products.sortOrder,
      isNew: products.isNew,
      mrp: products.mrp,
      mrpNote: products.mrpNote,
      prescribingSpecialities: products.prescribingSpecialities,
    })
    .from(products)
    .innerJoin(ranges, eq(products.rangeId, ranges.id))
    .where(eq(products.isPublished, true))
    .orderBy(asc(ranges.sortOrder), asc(products.sortOrder), asc(products.brand));
  return rows;
});

export const getRanges = cache(async (): Promise<Range[]> => {
  const [all, published] = await Promise.all([db.select().from(ranges).orderBy(asc(ranges.sortOrder), asc(ranges.shortName)), getPublishedProducts()]);
  return all
    .map((r) => {
      const inRange = published.filter((p) => p.rangeSlug === r.slug);
      return {
        slug: r.slug,
        shortName: r.shortName,
        icon: r.icon,
        productCount: inRange.length,
        dosageForms: [...new Set(inRange.map((p) => p.dosageForm).filter(Boolean))],
      };
    })
    .filter((r) => r.productCount > 0);
});

export const getCatalogueFigures = cache(async () => {
  const [items, rs] = await Promise.all([getPublishedProducts(), getRanges()]);
  return {
    products: items.length,
    ranges: rs.length,
    dosageForms: new Set(items.map((p) => p.dosageForm).filter(Boolean)).size,
  };
});

export const getNewAdditions = cache(async () => (await getPublishedProducts()).filter((p) => p.isNew));

/** One representative product per range, for the home page catalogue preview. */
export const getCataloguePreview = cache(async () => {
  const [items, rs] = await Promise.all([getPublishedProducts(), getRanges()]);
  return rs
    .map((r) => {
      const inRange = items.filter((p) => p.rangeSlug === r.slug);
      const pick = inRange.find((p) => /\d/.test(p.composition)) ?? inRange[0];
      return pick ? { product: pick, range: r } : null;
    })
    .filter((x): x is { product: Product; range: Range } => x !== null);
});

export type SearchSuggestion = {
  slug: string;
  brand: string;
  dosageForm: string;
  composition: string;
  rangeSlug: string;
  rangeName: string;
};

export async function searchProducts(query: string, rangeSlug?: string, limit = 8) {
  const q = normaliseSearch(query);
  if (q.length < 2) return { total: 0, results: [] as SearchSuggestion[] };
  const [items, rs] = await Promise.all([getPublishedProducts(), getRanges()]);
  const rangeName = new Map(rs.map((r) => [r.slug, r.shortName]));

  const matches = items
    .filter((p) => !rangeSlug || p.rangeSlug === rangeSlug)
    .filter((p) => matchesAllTerms(`${p.brand} ${p.dosageForm} ${p.composition} ${p.pack}`, q))
    .map((p) => {
      const brand = normaliseSearch(p.brand);
      return { p, score: brand.startsWith(q) ? 0 : brand.includes(q) ? 1 : 2 };
    })
    .sort((a, b) => a.score - b.score || a.p.sortOrder - b.p.sortOrder);

  return {
    total: matches.length,
    results: matches.slice(0, limit).map(({ p }) => ({
      slug: p.slug,
      brand: p.brand,
      dosageForm: p.dosageForm,
      composition: p.composition,
      rangeSlug: p.rangeSlug,
      rangeName: rangeName.get(p.rangeSlug) ?? "",
    })),
  };
}

export const getRange = cache(async (slug: string) => (await getRanges()).find((r) => r.slug === slug) ?? null);

export const getProductsInRange = cache(async (rangeSlug: string) => (await getPublishedProducts()).filter((p) => p.rangeSlug === rangeSlug));

/** Finds a product by slug regardless of range, so pages can redirect when a product moves range. */
export const getProductBySlug = cache(async (slug: string) => (await getPublishedProducts()).find((p) => p.slug === slug) ?? null);

export const getProductImages = cache(async (productId: number): Promise<ProductImage[]> => {
  const rows = await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
  return rows.map((r) => ({ src: uploadUrl(r.filePath), alt: r.alt, width: r.width, height: r.height }));
});

/** Main (first) image per product, for listing cards. */
export const getMainImages = cache(async (): Promise<Map<number, ProductImage>> => {
  const ids = (await getPublishedProducts()).map((p) => p.id);
  if (!ids.length) return new Map();
  const rows = await db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
  const map = new Map<number, ProductImage>();
  for (const r of rows) if (!map.has(r.productId)) map.set(r.productId, { src: uploadUrl(r.filePath), alt: r.alt, width: r.width, height: r.height });
  return map;
});

export const getRelatedProducts = cache(async (product: Product, limit = 4) => {
  const inRange = (await getProductsInRange(product.rangeSlug)).filter((p) => p.slug !== product.slug);
  const byDistance = (a: Product, b: Product) => Math.abs(a.sortOrder - product.sortOrder) - Math.abs(b.sortOrder - product.sortOrder);
  const sameForm = inRange.filter((p) => p.dosageForm === product.dosageForm).sort(byDistance);
  const rest = inRange.filter((p) => p.dosageForm !== product.dosageForm).sort(byDistance);
  return [...sameForm, ...rest].slice(0, limit);
});

/** Listing data sent to the browser: no price or specialities fields. */
export type CatalogueItem = Pick<Product, "id" | "slug" | "brand" | "dosageForm" | "composition" | "pack" | "rangeSlug" | "sortOrder" | "isNew"> & {
  rangeName: string;
  image?: string;
};

export const getCatalogueItems = cache(async (): Promise<CatalogueItem[]> => {
  const [items, rs, images] = await Promise.all([getPublishedProducts(), getRanges(), getMainImages()]);
  const names = new Map(rs.map((r) => [r.slug, r.shortName]));
  return items.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    dosageForm: p.dosageForm,
    composition: p.composition,
    pack: p.pack,
    rangeSlug: p.rangeSlug,
    sortOrder: p.sortOrder,
    isNew: p.isNew,
    rangeName: names.get(p.rangeSlug) ?? "",
    image: images.get(p.id)?.src,
  }));
});

/** Public display switches, pending counsel review. */
export const displayFlags = {
  showMrp: process.env.SHOW_MRP_PUBLIC === "true",
  showSpecialities: process.env.SHOW_PRESCRIBING_SPECIALITIES === "true",
};
