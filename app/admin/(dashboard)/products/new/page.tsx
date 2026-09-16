import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { listRangesWithCounts } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireStaff();
  const ranges = await listRangesWithCounts();
  return (
    <>
      <PageHeader title="Add product" back={{ href: "/admin/products", label: "Products" }} description="Images can be added after the product is created." />
      <Card className="p-4 sm:p-6">
        <ProductForm
          ranges={ranges}
          values={{
            brand: "",
            slug: "",
            dosageForm: "",
            composition: "",
            pack: "",
            rangeId: ranges[0]?.id ?? null,
            mrp: null,
            mrpNote: null,
            gstRate: null,
            prescribingSpecialities: null,
            reviewNote: null,
            sortOrder: 0,
            isNew: true,
            isPublished: false,
          }}
        />
      </Card>
    </>
  );
}
