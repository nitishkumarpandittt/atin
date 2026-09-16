"use server";

import { and, asc, eq, max, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { deleteImage, storeImage } from "@/lib/uploads/store";
import { bool, fail, guarded, ok, refreshSite, slugify, str, zodErrors, type ActionState } from "@/lib/admin/action-utils";

const { products, productImages } = schema;

const optionalNumber = (label: string, maxValue: number) =>
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === "") return null;
      const n = Number(v.replace(/,/g, ""));
      if (!Number.isFinite(n) || n < 0 || n > maxValue) {
        ctx.addIssue({ code: "custom", message: `Enter a valid ${label} or leave it blank.` });
        return z.NEVER;
      }
      return Math.round(n * 100) / 100;
    });

const productSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required.").max(160),
  slug: z.string().trim().max(160),
  dosageForm: z.string().trim().max(80),
  composition: z.string().trim().min(1, "Composition is required.").max(4000),
  pack: z.string().trim().max(160),
  rangeId: z.string().transform((v) => (v ? Number(v) : null)),
  mrp: optionalNumber("MRP", 99_999_999),
  mrpNote: z.string().trim().max(80),
  gstRate: optionalNumber("GST rate", 100),
  prescribingSpecialities: z.string().trim().max(255),
  reviewNote: z.string().trim().max(255),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).catch(0),
});

export async function saveProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id")) || null;
    const parsed = productSchema.safeParse({
      brand: str(fd, "brand"),
      slug: str(fd, "slug"),
      dosageForm: str(fd, "dosageForm"),
      composition: str(fd, "composition"),
      pack: str(fd, "pack"),
      rangeId: str(fd, "rangeId"),
      mrp: str(fd, "mrp"),
      mrpNote: str(fd, "mrpNote"),
      gstRate: str(fd, "gstRate"),
      prescribingSpecialities: str(fd, "prescribingSpecialities"),
      reviewNote: str(fd, "reviewNote"),
      sortOrder: str(fd, "sortOrder"),
    });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const v = parsed.data;

    const slug = slugify(v.slug || `${v.brand} ${v.dosageForm}`);
    if (!slug) return fail("Please check the highlighted fields.", { slug: "Enter a slug using letters and numbers." });
    const [clash] = await db
      .select({ id: products.id })
      .from(products)
      .where(id ? and(eq(products.slug, slug), ne(products.id, id)) : eq(products.slug, slug))
      .limit(1);
    if (clash) return fail("Please check the highlighted fields.", { slug: "Another product already uses this slug." });

    const values = {
      brand: v.brand,
      slug,
      dosageForm: v.dosageForm,
      composition: v.composition,
      pack: v.pack,
      rangeId: v.rangeId,
      mrp: v.mrp,
      mrpNote: v.mrpNote || null,
      gstRate: v.gstRate,
      prescribingSpecialities: v.prescribingSpecialities || null,
      reviewNote: v.reviewNote || null,
      sortOrder: v.sortOrder,
      isNew: bool(fd, "isNew"),
      isPublished: bool(fd, "isPublished"),
    };

    if (id) {
      await db.update(products).set(values).where(eq(products.id, id));
      refreshSite();
      return ok("Product saved.");
    }
    const [res] = await db.insert(products).values(values);
    refreshSite();
    redirect(`/admin/products/${res.insertId}?created=1`);
  });
}

export async function duplicateProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    const [src] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!src) return fail("Product not found.");
    let slug = `${src.slug}-copy`;
    for (let n = 2; (await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1)).length; n++) slug = `${src.slug}-copy-${n}`;
    // Copies start hidden and without images, so nothing half-edited appears publicly.
    const [res] = await db.insert(products).values({
      slug,
      brand: `${src.brand} (copy)`,
      dosageForm: src.dosageForm,
      composition: src.composition,
      pack: src.pack,
      mrp: src.mrp,
      mrpNote: src.mrpNote,
      gstRate: src.gstRate,
      prescribingSpecialities: src.prescribingSpecialities,
      reviewNote: src.reviewNote,
      rangeId: src.rangeId,
      isNew: src.isNew,
      sortOrder: src.sortOrder + 1,
      isPublished: false,
    });
    redirect(`/admin/products/${res.insertId}?duplicated=1`);
  });
}

export async function deleteProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    const images = await db.select({ filePath: productImages.filePath }).from(productImages).where(eq(productImages.productId, id));
    await db.delete(products).where(eq(products.id, id));
    await Promise.all(images.map((i) => deleteImage(i.filePath)));
    refreshSite();
    if (str(fd, "redirect") === "list") redirect("/admin/products?deleted=1");
    return ok("Product deleted.");
  });
}

export async function togglePublished(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    await db.update(products).set({ isPublished: str(fd, "value") === "1" }).where(eq(products.id, id));
    refreshSite();
    return ok("Updated.");
  });
}

/* ------------------------------------------------------------------ images (one file per request) */

export async function uploadProductImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const productId = Number(str(fd, "productId"));
    const file = fd.get("file");
    if (!(file instanceof File)) return fail("Choose an image to upload.");
    const [product] = await db.select({ brand: products.brand, dosageForm: products.dosageForm }).from(products).where(eq(products.id, productId)).limit(1);
    if (!product) return fail("Product not found.");
    const stored = await storeImage(file, "products").catch((e: Error) => e);
    if (stored instanceof Error) return fail(stored.message);
    const [{ top }] = await db.select({ top: max(productImages.sortOrder) }).from(productImages).where(eq(productImages.productId, productId));
    await db.insert(productImages).values({
      productId,
      filePath: stored.filePath,
      width: stored.width,
      height: stored.height,
      alt: `${product.brand} ${product.dosageForm}`.trim(),
      sortOrder: (top ?? -1) + 1,
    });
    refreshSite();
    return ok(`Uploaded ${file.name}.`);
  });
}

export async function updateImageAlt(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const alt = str(fd, "alt").trim().slice(0, 255);
    await db.update(productImages).set({ alt }).where(eq(productImages.id, Number(str(fd, "imageId"))));
    refreshSite();
    return ok("Alt text saved.");
  });
}

export async function makeMainImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const imageId = Number(str(fd, "imageId"));
    const [img] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1);
    if (!img) return fail("Image not found.");
    const all = await db.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, img.productId)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
    const ordered = [img.id, ...all.map((a) => a.id).filter((i) => i !== img.id)];
    await db.transaction(async (tx) => {
      for (const [i, imgId] of ordered.entries()) await tx.update(productImages).set({ sortOrder: i }).where(eq(productImages.id, imgId));
    });
    refreshSite();
    return ok("Main image updated.");
  });
}

export async function deleteProductImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const imageId = Number(str(fd, "imageId"));
    const [img] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1);
    if (!img) return fail("Image not found.");
    await db.delete(productImages).where(eq(productImages.id, imageId));
    await deleteImage(img.filePath);
    refreshSite();
    return ok("Image deleted.");
  });
}
