import { AboutTeaser } from "@/components/home/AboutTeaser";
import { Audiences } from "@/components/home/Audiences";
import { CataloguePreview } from "@/components/home/CataloguePreview";
import { EnquiryBand } from "@/components/home/EnquiryBand";
import { Hero } from "@/components/home/Hero";
import { LatestPosts } from "@/components/home/LatestPosts";
import { SegmentGrid } from "@/components/home/SegmentGrid";
import { SegmentMarquee } from "@/components/home/SegmentMarquee";
import { WhyAtin } from "@/components/home/WhyAtin";
import { getCatalogueFigures, getCataloguePreview, getNewAdditions, getRanges } from "@/lib/data/catalogue";
import { getPosts } from "@/lib/data/blog";
import { getPublicCompany, getPublishedTestimonials } from "@/lib/data/site";
import { Testimonials } from "@/components/home/Testimonials";
import { photo, type Photo } from "@/lib/site/photos";

const need = (slot: string): Photo => {
  const p = photo(slot);
  if (!p) throw new Error(`Missing photo for slot "${slot}"`);
  return p;
};

export default async function HomePage() {
  const [figures, ranges, newAdditions, preview, posts, company, testimonials] = await Promise.all([
    getCatalogueFigures(),
    getRanges(),
    getNewAdditions(),
    getCataloguePreview(),
    getPosts(),
    getPublicCompany(),
    getPublishedTestimonials(),
  ]);
  const rangeBySlug = new Map(ranges.map((r) => [r.slug, r]));
  const newItems = newAdditions.flatMap((p) => {
    const range = rangeBySlug.get(p.rangeSlug);
    return range ? [{ product: p, range }] : [];
  });

  return (
    <>
      <Hero figures={figures} ranges={ranges} photo={need("hero")} />
      <SegmentMarquee ranges={ranges} />
      <AboutTeaser figures={figures} photo={need("chemist-counter")} />
      <SegmentGrid ranges={ranges} totalProducts={figures.products} />
      {newItems.length > 0 ? (
        <CataloguePreview items={newItems} eyebrow="Just added" title="New additions" />
      ) : (
        <CataloguePreview items={preview} eyebrow="From the catalogue" title="A look across our range" />
      )}
      <Audiences photo={need("hospital-corridor")} />
      <WhyAtin
        photo={need("warehouse")}
        totalProducts={figures.products}
        samples={[preview[0], preview[3], preview[preview.length - 1]]
          .filter(Boolean)
          .map(({ product: p }) => ({ name: p.brand, meta: [p.dosageForm, p.pack].filter(Boolean).join(" · ") }))}
      />
      <Testimonials items={testimonials} />
      <LatestPosts posts={posts} />
      <EnquiryBand photo={need("team")} phone={company.phone} />
    </>
  );
}
