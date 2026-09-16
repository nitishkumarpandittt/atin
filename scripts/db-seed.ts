// Imports the client spreadsheet into ranges + products, and the starter blog posts.
//   npm run db:seed -- [path/to/sheet.xlsx] [--dry-run] [--replace]
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { parseCatalogue, type RangeDef } from "./catalogue-parse";
import { connect, describeDbError, schema } from "./db";

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const replace = args.includes("--replace");
const sheet = args.find((a) => !a.startsWith("--")) ?? path.join(root, "ATIN HEALTHCARE PVT LTD._segment wise list.xlsx");

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

async function main() {
  const ranges: RangeDef[] = JSON.parse(await readFile(path.join(root, "data/catalogue/ranges.json"), "utf8"));
  const { products, warnings } = await parseCatalogue(sheet, ranges);

  for (const w of warnings) console.warn(`warn: ${w}`);
  console.log(`\n${products.length} products in ${ranges.length} ranges`);
  for (const r of ranges) console.log(`  ${String(products.filter((p) => p.rangeSlug === r.slug).length).padStart(3)}  ${r.shortName}`);
  const review = products.filter((p) => p.needsReview.length);
  if (review.length) {
    console.log(`\n${review.length} products imported unpublished for copy review:`);
    for (const p of review) console.log(`  - ${p.brand} (${p.dosageForm}): ${p.needsReview.join("; ")}`);
  }
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
            isPublished: p.needsReview.length === 0,
            reviewNote: p.needsReview.length ? `Copy review: ${p.needsReview.join("; ")}` : null,
          })),
        );
      }
    });
    console.log(`\nImported ${products.length} products.`);

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
