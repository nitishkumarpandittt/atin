// Imports the client spreadsheet into ranges + products, the starter blog posts, and the catalogue
// images listed in data/catalogue/images.json (written by scripts/catalogue-images.ts).
//   npm run db:seed -- [path/to/sheet.xlsx] [--dry-run] [--replace]
//   npm run db:seed -- --images-only [--dry-run]    # only sync product_images from the manifest
//   npm run db:seed -- --publish-approved [--dry-run]  # publish flagged products the client approved
// Products the copy scan flags are imported unpublished unless listed in data/catalogue/approved-copy.json.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, inArray, sql } from "drizzle-orm";
import { parseCatalogue, type RangeDef } from "./catalogue-parse";
import { connect, describeDbError, schema } from "./db";

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const replace = args.includes("--replace");
const imagesOnly = args.includes("--images-only");
const publishApproved = args.includes("--publish-approved");
const sheet = args.find((a) => !a.startsWith("--")) ?? path.join(root, "ATIN HEALTHCARE PVT LTD._FINAL LIST.xlsx");

type Db = ReturnType<typeof connect>["db"];

/** One optimised image from data/catalogue/images.json; `products` lists the catalogue slugs it belongs to. */
type ManifestImage = { file: string; kind: "pack" | "visual"; source: string; width: number; height: number; alt: string; products: string[] };

/** Flagged products the client asked to publish anyway (data/catalogue/approved-copy.json). */
async function loadApproved() {
  const raw = await readFile(path.join(root, "data/catalogue/approved-copy.json"), "utf8").catch(() => null);
  const data = raw ? (JSON.parse(raw) as { approvedOn?: string; slugs?: string[] }) : {};
  return { slugs: new Set(data.slugs ?? []), note: `approved for publication by the client${data.approvedOn ? ` on ${data.approvedOn}` : ""}` };
}

// Publishes the approved slugs in place: only is_published and the review note change, nothing is re-imported.
async function publishApprovedProducts(db: Db) {
  const approved = await loadApproved();
  if (!approved.slugs.size) {
    console.log("No approved slugs in data/catalogue/approved-copy.json.");
    return;
  }
  const rows = await db
    .select({ id: schema.products.id, slug: schema.products.slug, reviewNote: schema.products.reviewNote })
    .from(schema.products)
    .where(and(inArray(schema.products.slug, [...approved.slugs]), eq(schema.products.isPublished, false)));
  const known = new Set((await db.select({ slug: schema.products.slug }).from(schema.products).where(inArray(schema.products.slug, [...approved.slugs]))).map((r) => r.slug));
  const missing = [...approved.slugs].filter((s) => !known.has(s));
  if (!dryRun) {
    for (const r of rows) {
      const reviewNote = r.reviewNote && !r.reviewNote.includes("approved for publication") ? `${r.reviewNote} (${approved.note})` : r.reviewNote;
      await db.update(schema.products).set({ isPublished: true, reviewNote }).where(eq(schema.products.id, r.id));
    }
  }
  console.log(`${rows.length} approved product(s) ${dryRun ? "would be published" : "published"}; ${known.size - rows.length} already public.`);
  for (const r of rows) console.log(`  + ${r.slug}`);
  if (missing.length) console.warn(`warn: approved slug(s) not in the catalogue: ${missing.join(", ")}`);
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  if (!match) return { meta, body: raw };
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: match[2].trim() };
}

// Adds a product_images row per manifest image x product slug. Rows that already exist keep their
// place (bundled ones get their size and alt refreshed from the manifest; admin uploads are never
// touched), so re-running never duplicates or removes anything. Per product, packs are numbered
// 0, 1, 2... in manifest order and visual aids 100, 101..., keeping visuals after packs.
async function syncImages(db: Db) {
  const manifestPath = path.join(root, "data/catalogue/images.json");
  const raw = await readFile(manifestPath, "utf8").catch(() => null);
  if (raw === null) {
    console.log(`\nImages: ${path.relative(root, manifestPath)} not found, skipped. Run scripts/catalogue-images.ts first.`);
    return;
  }
  const manifest: ManifestImage[] = JSON.parse(raw);
  const [rows, existing] = await Promise.all([
    db.select({ id: schema.products.id, slug: schema.products.slug }).from(schema.products),
    db
      .select({ id: schema.productImages.id, productId: schema.productImages.productId, filePath: schema.productImages.filePath, alt: schema.productImages.alt, width: schema.productImages.width, height: schema.productImages.height })
      .from(schema.productImages),
  ]);
  const idBySlug = new Map(rows.map((p) => [p.slug, p.id]));
  const present = new Map(existing.map((r) => [`${r.productId} ${r.filePath}`, r]));
  const nextSort = new Map<number, { pack: number; visual: number }>();
  const unmatched = new Set<string>();
  const toAdd: (typeof schema.productImages.$inferInsert)[] = [];
  const toRefresh: { id: number; alt: string; width: number; height: number }[] = [];
  let kept = 0;

  for (const entry of manifest) {
    for (const slug of entry.products) {
      const productId = idBySlug.get(slug);
      if (productId === undefined) {
        unmatched.add(slug);
        continue;
      }
      const counters = nextSort.get(productId) ?? { pack: 0, visual: 100 };
      nextSort.set(productId, counters);
      const sortOrder = entry.kind === "visual" ? counters.visual++ : counters.pack++;
      const key = `${productId} ${entry.file}`;
      const row = present.get(key);
      if (row) {
        if (row.alt !== entry.alt || row.width !== entry.width || row.height !== entry.height) toRefresh.push({ id: row.id, alt: entry.alt, width: entry.width, height: entry.height });
        else kept++;
        continue;
      }
      present.set(key, { id: 0, productId, filePath: entry.file, alt: entry.alt, width: entry.width, height: entry.height });
      toAdd.push({ productId, filePath: entry.file, alt: entry.alt, width: entry.width, height: entry.height, sortOrder });
    }
  }

  if (!dryRun) {
    for (let i = 0; i < toAdd.length; i += 100) await db.insert(schema.productImages).values(toAdd.slice(i, i + 100));
    for (const { id, ...fields } of toRefresh) await db.update(schema.productImages).set(fields).where(eq(schema.productImages.id, id));
  }
  console.log(`\nImages: ${toAdd.length} row(s) ${dryRun ? "would be added" : "added"}, ${toRefresh.length} refreshed, ${kept} unchanged.`);
  if (unmatched.size) console.warn(`warn: ${unmatched.size} manifest slug(s) matched no product: ${[...unmatched].sort().join(", ")}`);
}

async function main() {
  if (publishApproved) {
    const { db, pool } = connect();
    try {
      await publishApprovedProducts(db);
    } finally {
      await pool.end();
    }
    return;
  }

  if (imagesOnly) {
    const { db, pool } = connect();
    try {
      await syncImages(db);
    } finally {
      await pool.end();
    }
    return;
  }

  const ranges: RangeDef[] = JSON.parse(await readFile(path.join(root, "data/catalogue/ranges.json"), "utf8"));
  const { products, warnings } = await parseCatalogue(sheet, ranges);

  for (const w of warnings) console.warn(`warn: ${w}`);
  console.log(`\n${products.length} products in ${ranges.length} ranges`);
  for (const r of ranges) console.log(`  ${String(products.filter((p) => p.rangeSlug === r.slug).length).padStart(3)}  ${r.shortName}`);
  const approved = await loadApproved();
  const review = products.filter((p) => p.needsReview.length);
  const held = review.filter((p) => !approved.slugs.has(p.slug));
  const cleared = review.filter((p) => approved.slugs.has(p.slug));
  if (held.length) {
    console.log(`\n${held.length} products imported unpublished for copy review:`);
    for (const p of held) console.log(`  - ${p.brand} (${p.dosageForm}): ${p.needsReview.join("; ")}`);
  }
  if (cleared.length) console.log(`\n${cleared.length} flagged products published on client approval (data/catalogue/approved-copy.json).`);
  if (dryRun) {
    console.log("\nDry run: nothing written.");
    return;
  }

  const { db, pool } = connect();
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(schema.products);
    if (Number(count) > 0 && !replace) {
      throw new Error(`The products table already has ${count} rows. Re-run with --replace to wipe and re-import the catalogue.`);
    }

    await db.transaction(async (tx) => {
      if (replace) {
        await tx.delete(schema.productImages);
        await tx.delete(schema.products);
        await tx.delete(schema.ranges);
      }
      const rangeIds = new Map<string, number>();
      for (const [i, r] of ranges.entries()) {
        const [res] = await tx.insert(schema.ranges).values({ slug: r.slug, shortName: r.shortName, sourceHeading: r.sourceHeading, icon: r.icon, sortOrder: (i + 1) * 10 });
        rangeIds.set(r.slug, res.insertId);
      }
      for (let i = 0; i < products.length; i += 100) {
        await tx.insert(schema.products).values(
          products.slice(i, i + 100).map((p) => ({
            slug: p.slug,
            brand: p.brand,
            dosageForm: p.dosageForm,
            composition: p.composition,
            pack: p.pack,
            rangeId: rangeIds.get(p.rangeSlug) ?? null,
            sortOrder: p.sortOrder * 10,
            isPublished: p.needsReview.length === 0 || approved.slugs.has(p.slug),
            reviewNote: p.needsReview.length
              ? `Copy review: ${p.needsReview.join("; ")}${approved.slugs.has(p.slug) ? ` (${approved.note})` : ""}`
              : null,
          })),
        );
      }
    });
    console.log(`\nImported ${products.length} products.`);
    await syncImages(db);

    // Starter blog posts: only inserted when missing, never overwritten.
    const dir = path.join(root, "content", "blog");
    const files = (await readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".md"));
    let added = 0;
    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      const { meta, body } = parseFrontmatter(await readFile(path.join(dir, file), "utf8"));
      const [res] = await db
        .insert(schema.blogPosts)
        .values({
          slug,
          title: meta.title ?? slug,
          excerpt: meta.excerpt ?? "",
          content: body,
          author: meta.author ?? "Atin HealthCare",
          coverPath: meta.cover ?? "",
          isPublished: true,
          publishedOn: meta.publishedOn ?? "",
        })
        .onDuplicateKeyUpdate({ set: { slug: sql`slug` } });
      if (res.affectedRows === 1) added++;
    }
    console.log(`Blog: ${added} starter post(s) added.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(describeDbError(e));
  process.exit(1);
});
