import type { Metadata } from "next";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { Audiences } from "@/components/home/Audiences";
import { CataloguePreview } from "@/components/home/CataloguePreview";
import { EnquiryBand } from "@/components/home/EnquiryBand";
import { Hero } from "@/components/home/Hero";
import { SegmentGrid } from "@/components/home/SegmentGrid";
import { SegmentMarquee } from "@/components/home/SegmentMarquee";
import { WhyAtin } from "@/components/home/WhyAtin";
import { getCatalogueFigures, getCataloguePreview, getNewAdditions, getRanges, getMainImages } from "@/lib/data/catalogue";
import { getPublicCompany, getPublishedTestimonials } from "@/lib/data/site";
import { Testimonials } from "@/components/home/Testimonials";
import type { Photo } from "@/lib/site/photos";
import { sitePhoto } from "@/lib/data/site-images";
import { seoMeta, staticPages } from "@/lib/data/seo";

export async function generateMetadata(): Promise<Metadata> {
  return seoMeta(staticPages["/"]);
}

const need = async (key: string): Promise<Photo> => {
  const p = await sitePhoto(key);
  if (!p) throw new Error(`Missing photo for "${key}"`);
  return p;
};

export default async function HomePage() {
  const [figures, ranges, newAdditions, preview, company, testimonials, images] = await Promise.all([
    getCatalogueFigures(),
    getRanges(),
    getNewAdditions(),
    getCataloguePreview(),
    getPublicCompany(),
    getPublishedTestimonials(),
    getMainImages(),
  ]);
  const rangeBySlug = new Map(ranges.map((r) => [r.slug, r]));
  const newItems = newAdditions.flatMap((p) => {
    const range = rangeBySlug.get(p.rangeSlug);
    return range ? [{ product: p, range, image: images.get(p.id)?.src }] : [];
  });

  return (
    <>
      <Hero figures={figures} ranges={ranges} photo={await need("home-hero")} />
      <SegmentMarquee ranges={ranges} />
      <AboutTeaser figures={figures} photo={await need("home-about")} />
      <SegmentGrid ranges={ranges} totalProducts={figures.products} />
      {newItems.length > 0 ? (
        <CataloguePreview items={newItems} eyebrow="Just added" title="New additions" />
      ) : (
        <CataloguePreview items={preview} eyebrow="From the catalogue" title="A look across our range" />
      )}
      <Audiences photo={await need("home-audiences")} />
      <WhyAtin
        photo={await need("home-why")}
        totalProducts={figures.products}
        samples={[preview[0], preview[3], preview[preview.length - 1]]
          .filter(Boolean)
          .map(({ product: p }) => ({ name: p.brand, meta: [p.dosageForm, p.pack].filter(Boolean).join(" · ") }))}
      />
      <Testimonials items={testimonials} />
      <EnquiryBand photo={await need("home-enquiry")} phone={company.phone} />
    </>
  );
}
