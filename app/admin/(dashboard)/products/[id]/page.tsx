import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProduct, duplicateProduct } from "@/lib/admin/actions/products";
import { getProductForEdit, listRangesWithCounts } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";
import { uploadUrl } from "@/lib/uploads/url";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();
  const [product, ranges] = await Promise.all([getProductForEdit(productId), listRangesWithCounts()]);
  if (!product) notFound();
  const range = ranges.find((r) => r.id === product.rangeId);

  return (
    <>
      <PageHeader
        title={product.brand}
        back={{ href: "/admin/products", label: "Products" }}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            {product.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
            {product.isNew && <Badge tone="blue">New addition</Badge>}
            {product.reviewNote && <Badge tone="amber">{product.reviewNote}</Badge>}
          </span>
        }
        actions={
          <>
            {product.isPublished && range && (
              <Link href={`/products/${range.slug}/${product.slug}`} target="_blank" className="admin-btn admin-btn-secondary">
                <ExternalLink aria-hidden className="size-4" /> View on website
              </Link>
            )}
            <ActionButton action={duplicateProduct} fields={{ id: product.id }}>
              Duplicate
            </ActionButton>
            <ActionButton action={deleteProduct} fields={{ id: product.id, redirect: "list" }} variant="danger" confirm={`Delete ${product.brand}? This also removes its images and cannot be undone.`}>
              Delete
            </ActionButton>
          </>
        }
      />
      {(sp.created || sp.duplicated) && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
          {sp.created ? "Product created. You can add images below." : "Copy created. It is hidden and has no images until you edit it."}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-4 sm:p-6">
          <ProductForm key={product.updatedAt.toISOString()} ranges={ranges} values={product} />
        </Card>
        <Card title="Images" description="The first image is the main image on the website.">
          <div className="p-4 sm:p-5">
            <ImageManager
              productId={product.id}
              maxMb={Math.max(1, Number(process.env.MAX_UPLOAD_MB) || 5)}
              images={product.images.map((i) => ({ id: i.id, src: uploadUrl(i.filePath), alt: i.alt }))}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
