import "server-only";
import { cache } from "react";
import rangesJson from "@/data/catalogue/ranges.json";
import productsJson from "@/data/catalogue/products.json";
import { matchesAllTerms, normaliseSearch } from "@/lib/utils/search";

// Interim source: JSON exported from the client spreadsheet (npm run catalogue:export).
// The function signatures stay the same when this switches to MySQL via Drizzle.

export type Range = {
  slug: string;
  shortName: string;
  icon: string;
  productCount: number;
  dosageForms: string[];
};

export type Product = {
  slug: string;
  brand: string;
  dosageForm: string;
  composition: string;
  pack: string;
  rangeSlug: string;
  sortOrder: number;
  isNew: boolean;
};

type ProductRow = (typeof productsJson)[number];

const toProduct = (p: ProductRow): Product => ({
  slug: p.slug,
  brand: p.brand,
  dosageForm: p.dosageForm,
  composition: p.composition,
  pack: p.pack,
  rangeSlug: p.rangeSlug,
  sortOrder: p.sortOrder,
  isNew: p.isNew,
});

export const getPublishedProducts = cache(async (): Promise<Product[]> =>
  productsJson.filter((p) => p.isPublished).map(toProduct),
);

export const getRanges = cache(async (): Promise<Range[]> => {
  const products = await getPublishedProducts();
  return rangesJson
    .map((r) => {
      const inRange = products.filter((p) => p.rangeSlug === r.slug);
      return {
        slug: r.slug,
        shortName: r.shortName,
        icon: r.icon,
        productCount: inRange.length,
        dosageForms: [...new Set(inRange.map((p) => p.dosageForm))],
      };
    })
    .filter((r) => r.productCount > 0);
});

export const getCatalogueFigures = cache(async () => {
  const [products, ranges] = await Promise.all([getPublishedProducts(), getRanges()]);
  return {
    products: products.length,
    ranges: ranges.length,
    dosageForms: new Set(products.map((p) => p.dosageForm)).size,
  };
});

export const getNewAdditions = cache(async () => (await getPublishedProducts()).filter((p) => p.isNew));

/** One representative product per range, for the home page catalogue preview. */
export const getCataloguePreview = cache(async () => {
  const [products, ranges] = await Promise.all([getPublishedProducts(), getRanges()]);
  return ranges
    .map((r) => {
      const inRange = products.filter((p) => p.rangeSlug === r.slug);
      // Prefer an item with a real composition line over a bare product name.
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
  const [products, ranges] = await Promise.all([getPublishedProducts(), getRanges()]);
  const rangeName = new Map(ranges.map((r) => [r.slug, r.shortName]));

  const matches = products
    .filter((p) => !rangeSlug || p.rangeSlug === rangeSlug)
    .filter((p) => matchesAllTerms(`${p.brand} ${p.dosageForm} ${p.composition} ${p.pack}`, q))
    .map((p) => {
      const brand = normaliseSearch(p.brand);
      const score = brand.startsWith(q) ? 0 : brand.includes(q) ? 1 : 2;
      return { p, score };
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

export const getProductsInRange = cache(async (rangeSlug: string) =>
  (await getPublishedProducts()).filter((p) => p.rangeSlug === rangeSlug),
);

/** Finds a product by slug regardless of range, so pages can redirect when a product moves range. */
export const getProductBySlug = cache(async (slug: string) => (await getPublishedProducts()).find((p) => p.slug === slug) ?? null);

export const getRelatedProducts = cache(async (product: Product, limit = 4) => {
  const inRange = (await getProductsInRange(product.rangeSlug)).filter((p) => p.slug !== product.slug);
  const sameForm = inRange.filter((p) => p.dosageForm === product.dosageForm);
  const rest = inRange.filter((p) => p.dosageForm !== product.dosageForm);
  // Start near the product's own position so neighbours in the catalogue appear first.
  const byDistance = (a: Product, b: Product) => Math.abs(a.sortOrder - product.sortOrder) - Math.abs(b.sortOrder - product.sortOrder);
  return [...sameForm.sort(byDistance), ...rest.sort(byDistance)].slice(0, limit);
});

export type CatalogueItem = Product & { rangeName: string };

export const getCatalogueItems = cache(async (): Promise<CatalogueItem[]> => {
  const [products, ranges] = await Promise.all([getPublishedProducts(), getRanges()]);
  const names = new Map(ranges.map((r) => [r.slug, r.shortName]));
  return products.map((p) => ({ ...p, rangeName: names.get(p.rangeSlug) ?? "" }));
});
