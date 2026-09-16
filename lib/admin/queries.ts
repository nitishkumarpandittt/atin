import "server-only";
import { and, asc, count, desc, eq, isNotNull, isNull, like, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCompany } from "@/lib/data/site";

const { products, ranges, productImages, enquiries, credentials, testimonials, blogPosts, user } = schema;

export async function getSidebarCounts() {
  const rows = await db
    .select({ kind: enquiries.kind, n: count() })
    .from(enquiries)
    .where(eq(enquiries.status, "new"))
    .groupBy(enquiries.kind);
  const get = (k: string) => Number(rows.find((r) => r.kind === k)?.n ?? 0);
  return { enquiries: get("enquiry"), callbacks: get("callback") };
}

export async function getDashboardData() {
  const [[productStats], [rangeCount], [imageless], [noRange], latest, [enqNew], [cbNew], company, [credCount], [testiCount], [postCount]] = await Promise.all([
    db
      .select({
        total: count(),
        published: sql<number>`sum(${products.isPublished} = 1)`,
        review: sql<number>`sum(${products.reviewNote} is not null and ${products.isPublished} = 0)`,
        isNew: sql<number>`sum(${products.isNew} = 1)`,
      })
      .from(products),
    db.select({ n: count() }).from(ranges),
    db
      .select({ n: count() })
      .from(products)
      .where(and(eq(products.isPublished, true), sql`not exists (select 1 from ${productImages} where ${productImages.productId} = ${products.id})`)),
    db.select({ n: count() }).from(products).where(isNull(products.rangeId)),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(6),
    db.select({ n: count() }).from(enquiries).where(and(eq(enquiries.kind, "enquiry"), eq(enquiries.status, "new"))),
    db.select({ n: count() }).from(enquiries).where(and(eq(enquiries.kind, "callback"), eq(enquiries.status, "new"))),
    getCompany(),
    db.select({ n: count() }).from(credentials).where(eq(credentials.isPublished, true)),
    db.select({ n: count() }).from(testimonials).where(and(eq(testimonials.isPublished, true), eq(testimonials.hasPermission, true))),
    db.select({ n: count() }).from(blogPosts).where(eq(blogPosts.isPublished, true)),
  ]);

  const checklist = [
    { label: "Phone number", done: Boolean(company.phone), href: "/admin/company" },
    { label: "Email address", done: Boolean(company.email), href: "/admin/company" },
    { label: "Registered address", done: Boolean(company.registeredAddress), href: "/admin/company" },
    { label: "WhatsApp number", done: Boolean(company.whatsappNumber), href: "/admin/company" },
    { label: "Company profile", done: Boolean(company.profile.trim()), href: "/admin/company" },
    { label: "Vision & mission", done: Boolean(company.vision.trim() && company.mission.trim()), href: "/admin/company" },
    { label: "Director's message", done: Boolean(company.directorName && company.directorMessage), href: "/admin/company" },
    { label: "At least one licence / credential", done: Number(credCount.n) > 0, href: "/admin/credentials" },
    { label: "At least one testimonial (with permission)", done: Number(testiCount.n) > 0, href: "/admin/testimonials" },
    { label: "At least one blog post", done: Number(postCount.n) > 0, href: "/admin/blog" },
  ];

  return {
    stats: {
      products: Number(productStats.total),
      published: Number(productStats.published ?? 0),
      review: Number(productStats.review ?? 0),
      isNew: Number(productStats.isNew ?? 0),
      ranges: Number(rangeCount.n),
      enquiriesNew: Number(enqNew.n),
      callbacksNew: Number(cbNew.n),
    },
    catalogueChecks: [
      { label: "Products waiting for copy review (unpublished)", value: Number(productStats.review ?? 0), href: "/admin/products?status=review" },
      { label: "Published products without an image", value: Number(imageless.n), href: "/admin/products?status=published&images=none" },
      { label: "Products without a range", value: Number(noRange.n), href: "/admin/products?range=none" },
    ],
    latest,
    checklist,
  };
}

export type ProductFilters = {
  q?: string;
  range?: string;
  status?: "published" | "hidden" | "review" | "new" | "";
  mrp?: "set" | "missing" | "";
  images?: "none" | "";
  sort?: "catalogue" | "updated" | "name" | "mrp";
  page?: number;
};

export const ADMIN_PAGE_SIZE = 50;

export async function listProducts(f: ProductFilters) {
  const where: SQL[] = [];
  if (f.q) {
    const term = `%${f.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    where.push(or(like(products.brand, term), like(products.composition, term), like(products.pack, term), like(products.slug, term), like(products.mrpNote, term))!);
  }
  if (f.range === "none") where.push(isNull(products.rangeId));
  else if (f.range) where.push(eq(ranges.slug, f.range));
  if (f.status === "published") where.push(eq(products.isPublished, true));
  if (f.status === "hidden") where.push(eq(products.isPublished, false));
  if (f.status === "review") where.push(and(eq(products.isPublished, false), isNotNull(products.reviewNote))!);
  if (f.status === "new") where.push(eq(products.isNew, true));
  if (f.mrp === "set") where.push(or(isNotNull(products.mrp), isNotNull(products.mrpNote))!);
  if (f.mrp === "missing") where.push(and(isNull(products.mrp), isNull(products.mrpNote))!);
  if (f.images === "none") where.push(sql`not exists (select 1 from ${productImages} where ${productImages.productId} = ${products.id})`);

  const order =
    f.sort === "updated"
      ? [desc(products.updatedAt)]
      : f.sort === "name"
        ? [asc(products.brand)]
        : f.sort === "mrp"
          ? [sql`${products.mrp} is null`, asc(products.mrp)]
          : [asc(ranges.sortOrder), asc(products.sortOrder), asc(products.brand)];

  const page = Math.max(1, f.page ?? 1);
  const condition = where.length ? and(...where) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        brand: products.brand,
        dosageForm: products.dosageForm,
        composition: products.composition,
        pack: products.pack,
        mrp: products.mrp,
        mrpNote: products.mrpNote,
        isPublished: products.isPublished,
        isNew: products.isNew,
        reviewNote: products.reviewNote,
        updatedAt: products.updatedAt,
        rangeName: ranges.shortName,
        rangeSlug: ranges.slug,
        image: sql<string | null>`(select ${productImages.filePath} from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder}, ${productImages.id} limit 1)`,
      })
      .from(products)
      .leftJoin(ranges, eq(products.rangeId, ranges.id))
      .where(condition)
      .orderBy(...order)
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(products).leftJoin(ranges, eq(products.rangeId, ranges.id)).where(condition),
  ]);
  return { rows, total: Number(total), page, pages: Math.max(1, Math.ceil(Number(total) / ADMIN_PAGE_SIZE)) };
}

export async function getProductForEdit(id: number) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) return null;
  const images = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder), asc(productImages.id));
  return { ...row, images };
}

export async function listRangesWithCounts() {
  return db
    .select({
      id: ranges.id,
      slug: ranges.slug,
      shortName: ranges.shortName,
      sourceHeading: ranges.sourceHeading,
      icon: ranges.icon,
      sortOrder: ranges.sortOrder,
      productCount: sql<number>`(select count(*) from ${products} where ${products.rangeId} = ${ranges.id})`,
      publishedCount: sql<number>`(select count(*) from ${products} where ${products.rangeId} = ${ranges.id} and ${products.isPublished} = 1)`,
    })
    .from(ranges)
    .orderBy(asc(ranges.sortOrder), asc(ranges.shortName));
}

export async function listEnquiries(kind: "enquiry" | "callback", status: "new" | "handled" | "all", page = 1) {
  const condition = status === "all" ? eq(enquiries.kind, kind) : and(eq(enquiries.kind, kind), eq(enquiries.status, status));
  const size = 25;
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        e: enquiries,
        productSlug: products.slug,
        productRangeSlug: ranges.slug,
      })
      .from(enquiries)
      .leftJoin(products, eq(enquiries.productId, products.id))
      .leftJoin(ranges, eq(products.rangeId, ranges.id))
      .where(condition)
      .orderBy(desc(enquiries.createdAt))
      .limit(size)
      .offset((Math.max(1, page) - 1) * size),
    db.select({ total: count() }).from(enquiries).where(condition),
  ]);
  return { rows, total: Number(total), page, pages: Math.max(1, Math.ceil(Number(total) / size)) };
}

export const listCredentials = () => db.select().from(credentials).orderBy(asc(credentials.sortOrder), asc(credentials.id));
export const listTestimonials = () => db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
export const listBlogPosts = () => db.select().from(blogPosts).orderBy(desc(blogPosts.publishedOn), desc(blogPosts.id));
export async function getBlogPost(id: number) {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return row ?? null;
}

export const listStaff = () =>
  db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned, createdAt: user.createdAt })
    .from(user)
    .orderBy(asc(user.createdAt));
