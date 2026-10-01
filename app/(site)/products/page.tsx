import type { Metadata } from "next";
import { pageMeta } from "@/lib/site/seo";
import { PageHero } from "@/components/site/PageHero";
import { CatalogueBrowser } from "@/components/site/CatalogueBrowser";
import { CatalogueNote } from "@/components/site/CatalogueNote";
import { getCatalogueFigures, getCatalogueItems, getRanges } from "@/lib/data/catalogue";
import { photo, rangePhoto } from "@/lib/site/photos";

export const metadata: Metadata = pageMeta({
  title: "Products",
  description: "Browse the Atin HealthCare product catalogue by segment, dosage form, brand or composition.",
  path: "/products",
  // The filterable listing duplicates the range pages, which are the indexable entry points.
  robots: { index: false, follow: true },
});

const param = (v: string | string[] | undefined, max = 80) => (typeof v === "string" ? v.slice(0, max) : "");

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const [items, ranges, figures, sp] = await Promise.all([getCatalogueItems(), getRanges(), getCatalogueFigures(), searchParams]);
  const range = param(sp.range);
  const initial = {
    q: param(sp.q),
    range: ranges.some((r) => r.slug === range) ? range : "",
    form: param(sp.form),
    newOnly: sp.new === "1",
  };

  return (
    <>
      <PageHero
        eyebrow="Product catalogue"
        title="All products"
        intro={`${figures.products} products across ${figures.ranges} segments and ${figures.dosageForms} dosage forms. Search by brand, composition or pack, or filter by segment.`}
        photo={photo("warehouse")}
        crumbs={[{ label: "Products" }]}
      />
      <section className="container-site py-10 md:py-16 lg:py-20">
        <CatalogueBrowser
          items={items}
          ranges={ranges}
          initial={initial}
          rangePhotos={Object.fromEntries(ranges.flatMap((r) => (rangePhoto(r) ? [[r.slug, rangePhoto(r)!.src]] : [])))}
        />
        <CatalogueNote className="mt-12 md:mt-14" />
      </section>
    </>
  );
}
