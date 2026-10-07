import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { SiteImageCard } from "@/components/admin/SiteImageCard";
import { requireRole } from "@/lib/auth/dal";
import { getSiteImages, imagePlacements, sitePhoto } from "@/lib/data/site-images";

export const metadata: Metadata = { title: "Site images" };

export default async function SiteImagesPage() {
  await requireRole("editor");
  const custom = await getSiteImages();
  const cards = await Promise.all(
    imagePlacements.map(async (p) => {
      const current = await sitePhoto(p.key);
      return { placement: p, current: { src: current?.src ?? "", alt: current?.alt ?? "", position: current?.position ?? "center" }, custom: Boolean(custom[p.key]) };
    }),
  );
  const pages = [...new Set(imagePlacements.map((p) => p.page))];

  return (
    <>
      <PageHeader
        title="Site images"
        description={
          <>
            Replace the photos on each page. Segment photos (home segment cards and each segment page) are set in{" "}
            <Link href="/admin/ranges" className="font-medium text-blue-700 hover:underline">
              Ranges
            </Link>
            ; product photos on each product.
          </>
        }
      />
      <div className="space-y-8">
        {pages.map((page) => (
          <section key={page}>
            <h2 className="mb-3 text-base font-bold text-ink">{page}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards
                .filter((c) => c.placement.page === page)
                .map((c) => (
                  <SiteImageCard key={c.placement.key} placement={c.placement} current={c.current} custom={c.custom} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
