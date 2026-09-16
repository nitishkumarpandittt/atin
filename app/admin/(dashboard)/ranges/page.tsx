import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { RangeFields } from "@/components/admin/RangeRow";
import { deleteRange } from "@/lib/admin/actions/content";
import { listRangesWithCounts } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Ranges" };

export default async function RangesPage() {
  await requireStaff();
  const ranges = await listRangesWithCounts();
  const nextOrder = (ranges.at(-1)?.sortOrder ?? 0) + 10;

  return (
    <>
      <PageHeader title="Ranges" description="Product segments shown on the website. Use drug-class or format names only, never disease names." />

      <Card title="Add a range" className="mb-6">
        <div className="p-4 sm:p-5">
          <RangeFields range={{ shortName: "", slug: "", icon: "pill", sortOrder: nextOrder }} submitLabel="Add range" />
        </div>
      </Card>

      <Card title={`${ranges.length} ranges`} description="Ranges only appear on the website when they have at least one published product.">
        <ul className="divide-y divide-line">
          {ranges.map((r) => (
            <li key={r.id} className="p-4 sm:p-5">
              <RangeFields range={r} submitLabel="Save" />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <Link href={`/admin/products?range=${r.slug}`} className="font-medium text-blue-700 hover:underline">
                  {r.productCount} products ({r.publishedCount} published)
                </Link>
                {Number(r.productCount) === 0 ? (
                  <ActionButton action={deleteRange} fields={{ id: r.id }} variant="danger" confirm={`Delete the range "${r.shortName}"?`}>
                    Delete range
                  </ActionButton>
                ) : (
                  <span className="text-xs text-muted">Ranges can be deleted once they have no products.</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
