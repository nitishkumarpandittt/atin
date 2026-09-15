import { SiteChrome } from "@/components/chrome/SiteChrome";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { Audiences } from "@/components/home/Audiences";
import { CataloguePreview } from "@/components/home/CataloguePreview";
import { EnquiryBand } from "@/components/home/EnquiryBand";
import { Hero } from "@/components/home/Hero";
import { SegmentGrid } from "@/components/home/SegmentGrid";
import { SegmentMarquee } from "@/components/home/SegmentMarquee";
import { WhyAtin } from "@/components/home/WhyAtin";
import { getCatalogueFigures, getCataloguePreview, getNewAdditions, getRanges } from "@/lib/data/catalogue";

export default async function HomePage() {
  const [figures, ranges, newAdditions, preview] = await Promise.all([
    getCatalogueFigures(),
    getRanges(),
    getNewAdditions(),
    getCataloguePreview(),
  ]);
  const rangeBySlug = new Map(ranges.map((r) => [r.slug, r]));
  const newItems = newAdditions.flatMap((p) => {
    const range = rangeBySlug.get(p.rangeSlug);
    return range ? [{ product: p, range }] : [];
  });

  return (
    <SiteChrome overlayHeader>
      <Hero figures={figures} ranges={ranges} />
      <SegmentMarquee ranges={ranges} />
      <AboutTeaser figures={figures} />
      <SegmentGrid ranges={ranges} totalProducts={figures.products} />
      {newItems.length > 0 ? (
        <CataloguePreview items={newItems} eyebrow="Just added" title="New additions" />
      ) : (
        <CataloguePreview items={preview} eyebrow="From the catalogue" title="A look across our range" />
      )}
      <Audiences />
      <WhyAtin
        totalProducts={figures.products}
        samples={[preview[0], preview[3], preview[preview.length - 1]]
          .filter(Boolean)
          .map(({ product: p }) => ({ name: p.brand, meta: [p.dosageForm, p.pack].filter(Boolean).join(" · ") }))}
      />
      <EnquiryBand />
    </SiteChrome>
  );
}
