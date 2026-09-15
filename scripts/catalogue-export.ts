// Reads the client spreadsheet and writes data/catalogue/products.json.
// Interim data source for the public site until the MySQL seed (scripts/db-seed.ts) lands;
// both use the same parser.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCatalogue, type RangeDef } from "./catalogue-parse";

const root = process.cwd();
const sheet = process.argv[2] ?? path.join(root, "ATIN HEALTHCARE PVT LTD._segment wise list.xlsx");
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const ranges: RangeDef[] = JSON.parse(await readFile(path.join(root, "data/catalogue/ranges.json"), "utf8"));
  const { products, warnings } = await parseCatalogue(sheet, ranges);

  for (const w of warnings) console.warn(`warn: ${w}`);
  console.log(`\n${products.length} products`);
  for (const r of ranges) {
    const n = products.filter((p) => p.rangeSlug === r.slug).length;
    console.log(`  ${String(n).padStart(3)}  ${r.shortName}`);
  }
  const forms = [...new Set(products.map((p) => p.dosageForm))].sort();
  console.log(`\n${forms.length} dosage forms: ${forms.join(", ")}`);
  const review = products.filter((p) => p.needsReview.length);
  if (review.length) {
    console.log(`\n${review.length} products need copy review (hidden publicly):`);
    review.forEach((p) => console.log(`  - ${p.brand} ${p.dosageForm}: ${p.needsReview.join("; ")}`));
  }

  if (dryRun) return;
  const out = products.map(({ needsReview, ...p }) => ({
    slug: p.slug,
    brand: p.brand,
    dosageForm: p.dosageForm,
    composition: p.composition,
    pack: p.pack,
    rangeSlug: p.rangeSlug,
    sortOrder: p.sortOrder,
    isPublished: needsReview.length === 0,
    isNew: false,
    needsReview,
  }));
  await writeFile(path.join(root, "data/catalogue/products.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("\nWrote data/catalogue/products.json");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
