// Converts the client's raw product photos into optimised WebP files under public/catalogue/ and
// writes data/catalogue/images.json, which maps each file to catalogue product slugs for db-seed.
//   npm run catalogue:images -- [--packs "<dir>"] [--visuals "<dir>"] [--sheet <path/to/sheet.xlsx>] [--force]
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { parseCatalogue, type ParsedProduct, type RangeDef } from "./catalogue-parse";

type Kind = "pack" | "visual";
type KindKey = "packs" | "visuals";
type ImageEntry = { file: string; kind: Kind; source: string; width: number; height: number; alt: string; products: string[] };
// Source basename → product slugs, or null for a known product that is not in the sheet (skipped, reported).
type OverrideMap = Record<string, string[] | null>;

const root = process.cwd();
const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const force = args.includes("--force");
const sheet = option("sheet", path.join(root, "ATIN HEALTHCARE PVT LTD._FINAL LIST.xlsx"));
const manifestPath = path.join(root, "data/catalogue/images.json");
const overridesPath = path.join(root, "data/catalogue/image-overrides.json");

// Pack shots are square product photos; visual aids are portrait leaflets, so they keep a longer edge.
// Pack shots also carry a "Website | Email" strip along the bottom edge, which is trimmed off.
const KINDS: { kind: Kind; key: KindKey; dir: string; max: number; quality: number; altSuffix: string; trimFooter: boolean }[] = [
  { kind: "pack", key: "packs", dir: option("packs", path.join(root, "IMAGE WITH LOGO")), max: 1200, quality: 82, altSuffix: "pack", trimFooter: true },
  { kind: "visual", key: "visuals", dir: option("visuals", path.join(root, "VISUALS DESIGNS")), max: 1600, quality: 78, altSuffix: "visual aid", trimFooter: false },
];

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

// Filename tokens that end the brand part ("ATNOCAL-E 20 softcapsules" → "ATNOCAL-E 20").
const FORM_TOKENS = new Set([
  "tab", "tablet", "tablets", "cap", "caps", "capsule", "capsules", "susp", "suspension", "syp", "syrup", "drop", "drops",
  "inj", "injection", "injections", "softgel", "softgels", "softcapsules", "dry", "nanoshot", "nanoshots",
]);

const byString = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const normBrand = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const displayName = (file: string) => path.parse(file).name.replace(/\s+copy$/i, "").replace(/\s+/g, " ").trim();
// "CEFVERGE-100mg-5ml DRY SYP copy.jpg" → "cefverge-100mg-5ml-dry-syp"
const outputName = (file: string) => displayName(file).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Brand part of a filename: the tokens before the first form token or pack-size token (100ml, 50mg, 10x1x4).
// The first token is always the brand, so AFTYFLOX-500 or ATINFUR-XT are never cut short by the "x" rule.
function fileBrand(file: string): string {
  const tokens = displayName(file).split(" ");
  const end = tokens.findIndex((t, i) => i > 0 && (FORM_TOKENS.has(t.toLowerCase()) || (/\d/.test(t) && /ml|mg|x/i.test(t))));
  return (end < 0 ? tokens : tokens.slice(0, end)).join(" ");
}

async function listImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => {
    throw new Error(`Source folder not found: ${dir}`);
  });
  return entries.filter((e) => e.isFile() && IMAGE_EXT.test(e.name)).map((e) => e.name).sort(byString);
}

// Height of the dark-blue contact strip printed along the bottom of the pack shots, or 0 when there
// is none. The strip sits flush with the bottom edge (so the last row must be solid blue) and ends
// at the first plain-background row above it; its white lettering never fills a whole row.
async function footerBand(image: Sharp): Promise<number> {
  const { data, info } = await image.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const count = (y: number, test: (r: number, g: number, b: number) => boolean) => {
    let n = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (test(data[i], data[i + 1], data[i + 2])) n++;
    }
    return n;
  };
  const blue = (r: number, _g: number, b: number) => b > 100 && b - r > 50 && r < 110;
  const light = (r: number, g: number, b: number) => Math.min(r, g, b) >= 190;
  if (count(height - 1, blue) < width * 0.9) return 0;
  for (let y = height - 2; y >= height - 160; y--) {
    if (count(y, light) >= width * 0.98) return height - 1 - y;
  }
  return 0;
}

// Re-encodes only when the source is newer than the existing output (or --force); returns the output size either way.
async function convert(src: string, dest: string, max: number, quality: number, trimFooter: boolean) {
  const [s, d] = await Promise.all([stat(src), stat(dest).catch(() => null)]);
  if (!force && d && d.mtimeMs >= s.mtimeMs) {
    const meta = await sharp(dest).metadata();
    return { width: meta.width ?? 0, height: meta.height ?? 0, converted: false, trimmed: 0 };
  }
  let image = sharp(src).rotate();
  const band = trimFooter ? await footerBand(image) : 0;
  if (band) {
    const meta = await image.metadata();
    const { width = 0, height = 0 } = meta.orientation && meta.orientation >= 5 ? { width: meta.height, height: meta.width } : meta;
    image = image.extract({ left: 0, top: 0, width, height: height - band });
  }
  const info = await image
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(dest);
  return { width: info.width, height: info.height, converted: true, trimmed: band };
}

async function main() {
  const ranges: RangeDef[] = JSON.parse(await readFile(path.join(root, "data/catalogue/ranges.json"), "utf8"));
  const { products, warnings } = await parseCatalogue(sheet, ranges);
  for (const w of warnings) console.warn(`warn: ${w}`);
  console.log(`${products.length} products parsed from ${path.basename(sheet)}\n`);

  const overrides: Partial<Record<KindKey, OverrideMap>> = JSON.parse(await readFile(overridesPath, "utf8").catch(() => "{}"));
  const slugs = new Set(products.map((p) => p.slug));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byBrand = new Map<string, ParsedProduct[]>();
  for (const p of products) {
    const key = normBrand(p.brand);
    byBrand.set(key, [...(byBrand.get(key) ?? []), p]);
  }

  const report = { notInSheet: [] as string[], noMatch: [] as string[], ambiguous: [] as string[], invalidOverride: [] as string[] };
  const notes = { staleOverride: [] as string[], renamed: [] as string[] };
  const entries: ImageEntry[] = [];

  for (const k of KINDS) {
    const files = await listImages(k.dir);
    const outDir = path.join(root, "public", "catalogue", k.key);
    await mkdir(outDir, { recursive: true });

    const table = overrides[k.key] ?? {};
    const present = new Set(files);
    for (const [file, mapped] of Object.entries(table)) {
      if (!present.has(file)) notes.staleOverride.push(`${k.key}/${file}`);
      for (const s of mapped ?? []) if (!slugs.has(s)) report.invalidOverride.push(`${k.key}/${file} → ${s}`);
    }

    const used = new Set<string>();
    let converted = 0;
    let trimmed = 0;
    let fresh = 0;
    let skipped = 0;
    for (const file of files) {
      const label = `${k.key}/${file}`;
      let matched: string[] = [];
      if (Object.hasOwn(table, file)) {
        const mapped = table[file];
        if (mapped === null) {
          report.notInSheet.push(label);
          skipped++;
          continue;
        }
        matched = mapped.filter((s) => slugs.has(s));
      } else {
        const candidates = byBrand.get(normBrand(fileBrand(file))) ?? [];
        if (candidates.length === 1) matched = [candidates[0].slug];
        else if (candidates.length === 0) report.noMatch.push(label);
        else report.ambiguous.push(`${label} → ${candidates.map((p) => p.slug).join(", ")}`);
      }

      // Output names are unique per folder: a clash gets -2, -3 in source-name order.
      const base = outputName(file);
      let name = base;
      for (let n = 2; used.has(name); n++) name = `${base}-${n}`;
      used.add(name);
      if (name !== base) notes.renamed.push(`${label} → ${name}.webp`);

      const result = await convert(path.join(k.dir, file), path.join(outDir, `${name}.webp`), k.max, k.quality, k.trimFooter);
      if (result.trimmed) trimmed++;
      if (result.converted) converted++;
      else fresh++;

      const first = matched.map((s) => bySlug.get(s)).find((p) => p);
      const alt = first ? `${first.brand} ${first.dosageForm.toLowerCase()} ${k.altSuffix}` : `${displayName(file)} ${k.altSuffix}`;
      entries.push({ file: `/catalogue/${k.key}/${name}.webp`, kind: k.kind, source: file, width: result.width, height: result.height, alt, products: matched });
    }

    // Outputs whose source is gone (or is now marked "not in sheet") are removed so public/ only holds live files.
    const keep = new Set([...used].map((n) => `${n}.webp`));
    let removed = 0;
    for (const f of await readdir(outDir)) {
      if (keep.has(f)) continue;
      await unlink(path.join(outDir, f));
      removed++;
    }
    console.log(`${k.key}: ${files.length} source files — ${converted} converted (${trimmed} footer strips trimmed), ${fresh} up to date, ${skipped} skipped (not in sheet), ${removed} stale removed`);
  }

  entries.sort((a, b) => byString(a.kind, b.kind) || byString(a.file, b.file));
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(entries, null, 2) + "\n");
  const mapped = entries.filter((e) => e.products.length).length;
  console.log(`\nManifest: ${path.relative(root, manifestPath)} — ${entries.length} images, ${mapped} mapped to a product`);

  // Coverage counts only published products (the seed leaves items flagged for copy review unpublished).
  const published = products.filter((p) => !p.needsReview.length);
  const covered = (kind: Kind) => new Set(entries.filter((e) => e.kind === kind).flatMap((e) => e.products));
  const packs = covered("pack");
  const visuals = covered("visual");
  const withPack = published.filter((p) => packs.has(p.slug)).length;
  const withVisual = published.filter((p) => visuals.has(p.slug)).length;
  console.log(`\nCoverage: ${withPack}/${published.length} published products have a pack image, ${withVisual}/${published.length} have a visual aid`);
  for (const r of ranges) {
    const inRange = published.filter((p) => p.rangeSlug === r.slug);
    const n = inRange.filter((p) => packs.has(p.slug)).length;
    console.log(`  ${String(n).padStart(3)}/${String(inRange.length).padEnd(3)} ${r.shortName}`);
  }
  const photographed = new Set(products.filter((p) => packs.has(p.slug)).map((p) => p.rangeSlug));
  const missing = published.filter((p) => photographed.has(p.rangeSlug) && !packs.has(p.slug));
  if (missing.length) {
    console.log(`\n${missing.length} published products in photographed ranges have no pack image:`);
    for (const p of missing) console.log(`  - ${p.brand} (${p.dosageForm}) [${p.slug}]`);
  }

  const groups: [string, string[]][] = [
    ["not in sheet", report.notInSheet],
    ["no match", report.noMatch],
    ["ambiguous", report.ambiguous],
    ["invalid override slug", report.invalidOverride],
  ];
  const unresolved = groups.filter(([, list]) => list.length);
  console.log(unresolved.length ? "\nUnresolved files:" : "\nAll files resolved.");
  for (const [title, list] of unresolved) {
    console.log(`  ${title} (${list.length}):`);
    for (const line of list) console.log(`    ${line}`);
  }
  if (notes.staleOverride.length) {
    console.log(`\n  override without a source file (${notes.staleOverride.length}):`);
    for (const line of notes.staleOverride) console.log(`    ${line}`);
  }
  if (notes.renamed.length) {
    console.log(`\n  renamed to avoid an output clash (${notes.renamed.length}):`);
    for (const line of notes.renamed) console.log(`    ${line}`);
  }

  if (report.invalidOverride.length) {
    console.error(`\n${report.invalidOverride.length} override slug(s) do not exist in the sheet. Fix ${path.relative(root, overridesPath)}.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
