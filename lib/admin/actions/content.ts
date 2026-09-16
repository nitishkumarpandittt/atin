"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { companySchema, getCompany } from "@/lib/data/site";
import { deleteImage, storeImage } from "@/lib/uploads/store";
import { bool, fail, guarded, ok, refreshSite, slugify, str, zodErrors, type ActionState } from "@/lib/admin/action-utils";

/* ------------------------------------------------------------------ ranges */

const ICONS = ["pill", "bottle", "softgel", "syringe", "leaf", "tooth", "tube", "jar", "sparkles", "droplet"] as const;

const rangeSchema = z.object({
  shortName: z.string().trim().min(2, "Name is required.").max(120),
  slug: z.string().trim().max(120),
  icon: z.enum(ICONS, { message: "Choose an icon." }),
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
});

export async function saveRange(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id")) || null;
    const parsed = rangeSchema.safeParse({ shortName: str(fd, "shortName"), slug: str(fd, "slug"), icon: str(fd, "icon"), sortOrder: str(fd, "sortOrder") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const slug = slugify(parsed.data.slug || parsed.data.shortName);
    const [clash] = await db
      .select({ id: schema.ranges.id })
      .from(schema.ranges)
      .where(id ? and(eq(schema.ranges.slug, slug), ne(schema.ranges.id, id)) : eq(schema.ranges.slug, slug))
      .limit(1);
    if (clash) return fail("Please check the highlighted fields.", { slug: "Another range already uses this slug." });
    const values = { ...parsed.data, slug };
    if (id) await db.update(schema.ranges).set(values).where(eq(schema.ranges.id, id));
    else await db.insert(schema.ranges).values(values);
    refreshSite();
    return ok(id ? "Range saved." : "Range created.");
  });
}

export async function saveRangeImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    const [range] = await db.select().from(schema.ranges).where(eq(schema.ranges.id, id)).limit(1);
    if (!range) return fail("Range not found.");

    const alt = str(fd, "imageAlt").trim().slice(0, 255);
    const file = fd.get("image");
    let imagePath = range.imagePath;
    if (file instanceof File && file.size > 0) {
      const stored = await storeImage(file, "site").catch((e: Error) => e);
      if (stored instanceof Error) return fail(stored.message, { image: stored.message });
      if (imagePath) await deleteImage(imagePath);
      imagePath = stored.filePath;
    } else if (bool(fd, "removeImage") && imagePath) {
      await deleteImage(imagePath);
      imagePath = "";
    }
    await db.update(schema.ranges).set({ imagePath, imageAlt: alt }).where(eq(schema.ranges.id, id));
    refreshSite();
    return ok(imagePath ? "Range image saved." : "Range image removed.");
  });
}

export async function deleteRange(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    const [{ n }] = await db.select({ n: count() }).from(schema.products).where(eq(schema.products.rangeId, id));
    if (Number(n) > 0) return fail(`Move or delete its ${n} product(s) first.`);
    const [row] = await db.select({ imagePath: schema.ranges.imagePath }).from(schema.ranges).where(eq(schema.ranges.id, id)).limit(1);
    await db.delete(schema.ranges).where(eq(schema.ranges.id, id));
    if (row?.imagePath) await deleteImage(row.imagePath);
    refreshSite();
    return ok("Range deleted.");
  });
}

/* ------------------------------------------------------------------ enquiries */

export async function setEnquiryStatus(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const status = str(fd, "status") === "handled" ? "handled" : "new";
    await db.update(schema.enquiries).set({ status }).where(eq(schema.enquiries.id, Number(str(fd, "id"))));
    return ok(status === "handled" ? "Marked as handled." : "Marked as new.");
  });
}

export async function deleteEnquiry(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    await db.delete(schema.enquiries).where(eq(schema.enquiries.id, Number(str(fd, "id"))));
    return ok("Deleted.");
  });
}

/* ------------------------------------------------------------------ company */

const phoneLike = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || /^[+\d][\d\s()-]{6,}$/.test(v), "Enter a valid phone number or leave it blank.");

const companyInput = companySchema.extend({
  phone: phoneLike,
  whatsappNumber: phoneLike,
  email: z
    .string()
    .trim()
    .max(191)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email or leave it blank."),
  profile: z.string().trim().max(8000),
  vision: z.string().trim().max(2000),
  mission: z.string().trim().max(4000),
  directorName: z.string().trim().max(120),
  directorRole: z.string().trim().max(120),
  directorMessage: z.string().trim().max(8000),
  registeredAddress: z.string().trim().max(500),
  businessHours: z.string().trim().max(120),
});

export async function saveCompany(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const current = await getCompany();
    const fields = Object.keys(companySchema.shape).filter((k) => k !== "directorPhotoPath");
    const parsed = companyInput.safeParse({ ...Object.fromEntries(fields.map((k) => [k, str(fd, k)])), directorPhotoPath: current.directorPhotoPath });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    if (parsed.data.directorMessage && !parsed.data.directorName) return fail("Please check the highlighted fields.", { directorName: "Add the director's name to show the message." });

    let photo = current.directorPhotoPath;
    const file = fd.get("directorPhoto");
    if (file instanceof File && file.size > 0) {
      const stored = await storeImage(file, "site").catch((e: Error) => e);
      if (stored instanceof Error) return fail(stored.message, { directorPhoto: stored.message });
      if (photo) await deleteImage(photo);
      photo = stored.filePath;
    } else if (bool(fd, "removeDirectorPhoto") && photo) {
      await deleteImage(photo);
      photo = "";
    }

    const value = JSON.stringify({ ...parsed.data, directorPhotoPath: photo });
    await db.insert(schema.siteSettings).values({ key: "company", value }).onDuplicateKeyUpdate({ set: { value } });
    refreshSite();
    return ok("Company details saved. The website has been updated.");
  });
}

/* ------------------------------------------------------------------ credentials */

const credentialSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(160),
  issuingAuthority: z.string().trim().max(160),
  number: z.string().trim().max(120),
  validUntil: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date or leave it blank."),
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
});

export async function saveCredential(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id")) || null;
    const parsed = credentialSchema.safeParse({ name: str(fd, "name"), issuingAuthority: str(fd, "issuingAuthority"), number: str(fd, "number"), validUntil: str(fd, "validUntil"), sortOrder: str(fd, "sortOrder") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const values = { ...parsed.data, isPublished: bool(fd, "isPublished") };
    if (id) await db.update(schema.credentials).set(values).where(eq(schema.credentials.id, id));
    else await db.insert(schema.credentials).values(values);
    refreshSite();
    return ok(id ? "Credential saved." : "Credential added.");
  });
}

export async function deleteCredential(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    await db.delete(schema.credentials).where(eq(schema.credentials.id, Number(str(fd, "id"))));
    refreshSite();
    return ok("Credential deleted.");
  });
}

/* ------------------------------------------------------------------ testimonials */

const testimonialSchema = z.object({
  quote: z.string().trim().min(10, "Add the testimonial text.").max(1200),
  name: z.string().trim().min(2, "Name is required.").max(120),
  role: z.string().trim().max(120),
  organisation: z.string().trim().max(160),
  sortOrder: z.coerce.number().int().min(0).max(100000).catch(0),
});

export async function saveTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id")) || null;
    const parsed = testimonialSchema.safeParse({ quote: str(fd, "quote"), name: str(fd, "name"), role: str(fd, "role"), organisation: str(fd, "organisation"), sortOrder: str(fd, "sortOrder") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const hasPermission = bool(fd, "hasPermission");
    const isPublished = bool(fd, "isPublished");
    if (isPublished && !hasPermission) return fail("A testimonial can only be published when permission is confirmed.", { hasPermission: "Confirm permission before publishing." });
    const values = { ...parsed.data, hasPermission, isPublished };
    if (id) await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, id));
    else await db.insert(schema.testimonials).values(values);
    refreshSite();
    return ok(id ? "Testimonial saved." : "Testimonial added.");
  });
}

export async function deleteTestimonial(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    await db.delete(schema.testimonials).where(eq(schema.testimonials.id, Number(str(fd, "id"))));
    refreshSite();
    return ok("Testimonial deleted.");
  });
}

/* ------------------------------------------------------------------ blog */

const blogSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(200),
  slug: z.string().trim().max(160),
  excerpt: z.string().trim().max(400, "Keep the summary under 400 characters."),
  content: z.string().trim().min(20, "Write the article (at least a few sentences).").max(200000),
  author: z.string().trim().max(120),
  publishedOn: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date."),
});

export async function saveBlogPost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id")) || null;
    const parsed = blogSchema.safeParse({ title: str(fd, "title"), slug: str(fd, "slug"), excerpt: str(fd, "excerpt"), content: str(fd, "content"), author: str(fd, "author"), publishedOn: str(fd, "publishedOn") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const v = parsed.data;
    const slug = slugify(v.slug || v.title);
    const [clash] = await db
      .select({ id: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(id ? and(eq(schema.blogPosts.slug, slug), ne(schema.blogPosts.id, id)) : eq(schema.blogPosts.slug, slug))
      .limit(1);
    if (clash) return fail("Please check the highlighted fields.", { slug: "Another post already uses this slug." });

    const isPublished = bool(fd, "isPublished");
    const publishedOn = v.publishedOn || (isPublished ? new Date().toISOString().slice(0, 10) : "");

    let coverPath: string | undefined;
    const existing = id ? (await db.select({ coverPath: schema.blogPosts.coverPath }).from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).limit(1))[0] : undefined;
    const file = fd.get("cover");
    if (file instanceof File && file.size > 0) {
      const stored = await storeImage(file, "blog").catch((e: Error) => e);
      if (stored instanceof Error) return fail(stored.message, { cover: stored.message });
      if (existing?.coverPath?.startsWith("blog/")) await deleteImage(existing.coverPath);
      coverPath = stored.filePath;
    } else if (bool(fd, "removeCover")) {
      if (existing?.coverPath?.startsWith("blog/")) await deleteImage(existing.coverPath);
      coverPath = "";
    }

    const values = { title: v.title, slug, excerpt: v.excerpt, content: v.content, author: v.author || "Atin HealthCare", publishedOn, isPublished, ...(coverPath !== undefined ? { coverPath } : {}) };
    if (id) {
      await db.update(schema.blogPosts).set(values).where(eq(schema.blogPosts.id, id));
      refreshSite();
      return ok(isPublished ? "Post saved and published." : "Draft saved.");
    }
    const [res] = await db.insert(schema.blogPosts).values(values);
    refreshSite();
    redirect(`/admin/blog/${res.insertId}?created=1`);
  });
}

export async function deleteBlogPost(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(undefined, async () => {
    const id = Number(str(fd, "id"));
    const [row] = await db.select({ coverPath: schema.blogPosts.coverPath }).from(schema.blogPosts).where(eq(schema.blogPosts.id, id)).limit(1);
    await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
    if (row?.coverPath?.startsWith("blog/")) await deleteImage(row.coverPath);
    refreshSite();
    if (str(fd, "redirect") === "list") redirect("/admin/blog?deleted=1");
    return ok("Post deleted.");
  });
}
