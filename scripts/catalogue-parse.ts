import ExcelJS from "exceljs";

export type RangeDef = {
  slug: string;
  shortName: string;
  sourceHeading: string;
  icon: string;
};

export type ParsedProduct = {
  serial: number;
  slug: string;
  brand: string;
  dosageForm: string;
  composition: string;
  pack: string;
  rangeSlug: string;
  sortOrder: number;
  needsReview: string[];
};

const normHeading = (s: string) => s.replace(/\s+/g, " ").trim().replace(/:$/, "").trim().toUpperCase();

const cellText = (v: ExcelJS.CellValue): string => {
  if (v == null) return "";
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
    if ("text" in v) return String(v.text);
    if ("result" in v) return String(v.result ?? "");
  }
  return String(v);
};

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/\s+([,)])/g, "$1").trim();

// Matched against the end of the upper-cased brand. `strip` removes an abbreviation (TAB, CAP)
// from the display name; full words such as SOAP or EYE DROP stay part of the name.
const FORM_SUFFIXES: { re: RegExp; form: string; strip: boolean }[] = [
  { re: /\bNASAL SPRAY$/, form: "Nasal Spray", strip: false },
  { re: /\bEYE DROPS?$/, form: "Eye Drops", strip: false },
  { re: /\bEAR DROPS?$/, form: "Ear Drops", strip: false },
  { re: /\bNASAL DROPS?$/, form: "Nasal Drops", strip: false },
  { re: /\bDUSTING POWDER$/, form: "Dusting Powder", strip: false },
  { re: /\bSOFTGEL(?: CAP(?:S|SULES?)?)?$/, form: "Softgel Capsule", strip: true },
  { re: /\bDRY SYP$/, form: "Dry Syrup", strip: true },
  { re: /\bD\/S$/, form: "Dry Syrup", strip: true },
  { re: /\bSUSP$/, form: "Suspension", strip: true },
  { re: /\bSYP$/, form: "Syrup", strip: true },
  { re: /\bSYRUP$|\bTONIC$|\bPURIFIER$/, form: "Syrup", strip: false },
  { re: /\bNANOSHOT$/, form: "Oral Solution", strip: false },
  { re: /\bDROPS?$/, form: "Oral Drops", strip: true },
  { re: /\bINJ$|\bINJECTION$/, form: "Injection", strip: true },
  { re: /\bTAB(?:S|LETS?)?$/, form: "Tablet", strip: true },
  { re: /\bCAPS?$|\bCAPSULES?$/, form: "Capsule", strip: true },
  { re: /\bSACHET$/, form: "Sachet", strip: false },
  { re: /\bPOWDER$/, form: "Powder", strip: false },
  { re: /\bOINT(?:MENT)?$/, form: "Ointment", strip: true },
  { re: /\bGEL$/, form: "Gel", strip: false },
  { re: /\bSOAP$/, form: "Soap", strip: false },
  { re: /\bLOTION$/, form: "Lotion", strip: false },
  { re: /\bSHAMPOO$/, form: "Shampoo", strip: false },
  { re: /\bMOUTHWASH$/, form: "Mouthwash", strip: false },
  { re: /\bFACEWASH$|\bWASH$/, form: "Wash", strip: false },
  { re: /\bCREAM$/, form: "Cream", strip: false },
  { re: /\bGARGLE$/, form: "Gargle", strip: false },
  { re: /\bOIL$/, form: "Oil", strip: false },
  { re: /\bSPF-?\d+$/, form: "Lotion", strip: false },
];

const RANGE_FALLBACK_FORM: Record<string, string> = {
  dental: "Toothpaste",
  "tablets-capsules": "Tablet",
};

const SHORT_CODES = new Set(["DSR", "SPF", "DHA", "WFI", "CPM", "LSR"]);

function titleWord(w: string): string {
  const up = w.toUpperCase();
  if (/\d/.test(w) || SHORT_CODES.has(up) || /^[A-Z]{1,2}$/i.test(w)) return up;
  return up.charAt(0) + up.slice(1).toLowerCase();
}

const titleName = (s: string) =>
  s
    .split(/([\s\-/()]+)/)
    .map((t) => (!t || /^[\s\-/()]+$/.test(t) ? t : titleWord(t)))
    .join("");

function splitBrand(rawBrand: string, rangeSlug: string) {
  let b = clean(rawBrand).toUpperCase().replace(/\.+$/, "");
  b = b.replace(/\s*-\s*/g, "-");
  // "AYURATIN-(LIVER SYRUP)" → "AYURATIN LIVER SYRUP" when the bracket holds the form; variants such as
  // "(VANILLA)" or "(VANILLA/CHOCOLATE)" stay bracketed so the form before them is still found.
  b = b.replace(/-?\s*\(([^)]*)\)$/, (_m, inner: string) => {
    const t = inner.trim();
    return FORM_SUFFIXES.some((f) => f.re.test(t)) ? ` ${t}` : ` (${t})`;
  });
  b = b.replace(/-$/, "").replace(/\s+/g, " ").trim();

  const matchOn = b.replace(/\s*\([^)]*\)$/, "");
  for (const f of FORM_SUFFIXES) {
    if (!f.re.test(matchOn)) continue;
    const name = f.strip ? b.replace(f.re, "").replace(/[-\s.]+$/, "") : b;
    if (name) return { brand: titleName(name), dosageForm: f.form };
  }
  return { brand: titleName(b), dosageForm: RANGE_FALLBACK_FORM[rangeSlug] ?? "Other" };
}

const UNIT_CASE: [RegExp, string][] = [
  [/(\d)\s*mg\b/gi, "$1 mg"],
  [/(\d)\s*mcg\b/gi, "$1 mcg"],
  [/(\d)\s*ml\b/gi, "$1 ml"],
  [/(\d)\s*gm\b/gi, "$1 gm"],
  [/(\d)\s*(?:i\.u\.|iu)(?=[\s/,)]|$)/gi, "$1 IU"],
  [/\s*%\s*w\/w\b/gi, "% w/w"],
  [/\s*%\s*w\/v\b/gi, "% w/v"],
  [/\bI\.P\.(?=\s|$)/g, "IP"],
  [/\bIp\b/g, "IP"],
  [/\bBp\b/g, "BP"],
  [/\bHcl\b/gi, "HCl"],
  [/\bSpf\s*(\d+)/gi, "SPF $1"],
  [/\bDha\b/g, "DHA"],
  [/\bWfi\b/g, "WFI"],
  [/\bEq\. To\b/g, "eq. to"],
  [/\bWith\b/g, "with"],
  [/\bAnd\b/g, "and"],
  [/`/g, " "],
];

// Mostly-uppercase compositions become readable case; mixed case is kept as written.
function tidyComposition(s: string): string {
  const letters = s.replace(/[^a-z]/gi, "");
  const upper = s.replace(/[^A-Z]/g, "");
  let out = s.replace(/\s*\+\s*/g, " + ").replace(/,(?=\S)/g, ", ").replace(/\(\s+/g, "(");
  if (letters.length && upper.length / letters.length > 0.7) {
    out = out.replace(/[A-Za-z][A-Za-z']*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }
  for (const [re, rep] of UNIT_CASE) out = out.replace(re, rep);
  return out.replace(/\s+/g, " ").trim();
}

function tidyPack(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\s*x\s*(?=\d)/g, " x ")
    .replace(/(\d)\s*(ml|gm)\b/g, "$1 $2")
    .replace(/alu-alu/g, "Alu-Alu")
    .replace(/\s*\/\s*(?=[a-z])/gi, " / ")
    .replace(/caps\.in/g, "caps in")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Wording a reviewer must clear before the item is shown publicly (condition / purpose claims).
const REVIEW_PATTERNS: [RegExp, string][] = [
  [/\b(remov|cure|treat|prevent|heal|relief|reliev|killer|purifier)/i, "purpose or claim wording"],
  [/\b(ulcer|anti ?septic|stone|pain|arthritis|diabet|cancer|liver|uterine|utrine|cough|brain)\b/i, "condition wording"],
];

export async function parseCatalogue(filePath: string, ranges: RangeDef[]) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  const byHeading = new Map(ranges.map((r) => [normHeading(r.sourceHeading), r]));

  const products: ParsedProduct[] = [];
  const warnings: string[] = [];
  let current: RangeDef | null = null;
  let headerSeen = false;

  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells = [1, 2, 3, 4].map((c) => clean(cellText(row.getCell(c).value)));
    const [sno, brand, composition, pack] = cells;
    if (cells.every((c) => !c)) return;

    if (/^S\.?\s*NO/i.test(sno)) {
      headerSeen = true;
      return;
    }

    const serial = Number(sno);
    const texts = cells.filter(Boolean);
    if (!sno || Number.isNaN(serial)) {
      if (texts.length === 1) {
        const r = byHeading.get(normHeading(texts[0]));
        if (r) {
          current = r;
          return;
        }
        if (!headerSeen) return; // title rows above the table
        throw new Error(`Row ${rowNumber}: unknown section heading "${texts[0]}". Add it to data/catalogue/ranges.json.`);
      }
      warnings.push(`Row ${rowNumber}: skipped unrecognised row ${JSON.stringify(cells)}`);
      return;
    }

    if (!current) throw new Error(`Row ${rowNumber}: product before any section heading`);
    if (!brand) {
      warnings.push(`Row ${rowNumber}: serial ${serial} has no brand, skipped`);
      return;
    }

    const { brand: name, dosageForm } = splitBrand(brand, current.slug);
    const needsReview = REVIEW_PATTERNS.filter(([re]) => re.test(`${brand} ${composition}`)).map(([, why]) => why);
    products.push({
      serial,
      slug: "",
      brand: name,
      dosageForm,
      composition: tidyComposition(composition),
      pack: tidyPack(pack),
      rangeSlug: current.slug,
      sortOrder: products.length + 1,
      needsReview,
    });
  });

  // Serial gaps are reported, never fatal.
  const serials = new Set(products.map((p) => p.serial));
  const max = Math.max(...serials);
  for (let s = 1; s <= max; s++) {
    if (!serials.has(s)) warnings.push(`Serial ${s} is missing in the sheet`);
  }

  // Deterministic slugs: brand; if shared, brand + dosage form (unless the name already ends with it);
  // if still shared (the same product listed per pack size), brand + pack size; then -2, -3.
  const count = (keys: string[]) => keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>());
  const withForm = (p: ParsedProduct) => {
    const base = slugify(p.brand);
    const form = slugify(p.dosageForm);
    return base.endsWith(form) ? base : `${base}-${form}`;
  };
  const brandCount = count(products.map((p) => slugify(p.brand)));
  const formCount = count(products.map(withForm));
  const used = new Set<string>();
  for (const p of products) {
    const base = slugify(p.brand);
    let s = base;
    if (brandCount.get(base)! > 1) {
      s = withForm(p);
      const size = p.pack.match(/(\d+(?:\.\d+)?)\s*(ml|gm|g|mg)\b/i);
      if (formCount.get(s)! > 1 && size) s = slugify(`${s} ${size[1]} ${size[2]}`);
    }
    let final = s;
    for (let n = 2; used.has(final); n++) final = `${s}-${n}`;
    used.add(final);
    p.slug = final;
  }

  return { products, warnings };
}
