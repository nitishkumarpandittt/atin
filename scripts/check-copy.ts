// Scans public-facing copy for wording that pharma advertising rules in India do not allow on a
// trade website. Runs before every build. A reviewed line can be exempted with a
// `copy-check: <reason>` comment on the same or the previous line.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const SCAN_DIRS = ["app", "components", "lib/site"];
const EXTRA_FILES = ["data/catalogue/ranges.json"];
const SKIP = [/[\\/]admin[\\/]/, /[\\/]api[\\/]/];

type Rule = { id: string; re: RegExp; why: string };

const RULES: Rule[] = [
  { id: "cure-claim", re: /\b(cures?|cured|curing|heals?|healing|eliminates?|eradicates?)\b/i, why: "treatment/cure claim" },
  { id: "treat-disease", re: /\b(treat|treats|treatment of|prevents?|prevention of|relief from|relieves?)\b/i, why: "treat/prevent wording" },
  { id: "efficacy", re: /\b(most effective|best (medicine|treatment|results)|guaranteed|100% (safe|effective)|no side[- ]effects|clinically proven|miracle|superior to)\b/i, why: "efficacy or superiority claim" },
  { id: "sales", re: /\b(buy now|buy online|order now|order online|add to cart|discount|special offer|limited offer)\b/i, why: "direct sales / offer wording" },
  { id: "manufacturing", re: /\b(we manufacture|our (manufacturing|factory|plant)|manufactured by us|GMP[- ]certified plant)\b/i, why: "manufacturing claim" },
  { id: "disease", re: /\b(diabetes|cancer|arthritis|kidney stones?|ulcers?|infections?|asthma|hypertension|covid)\b/i, why: "disease name in marketing copy" },
];

type Finding = { file: string; line: number; rule: Rule; text: string };

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(tsx?|mts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function exempt(lines: string[], line: number) {
  return /copy-check:/.test(lines[line - 1] ?? "") || /copy-check:/.test(lines[line - 2] ?? "");
}

/** Only human-readable strings are checked: JSX text, string literals with spaces, template text. */
function collectStrings(file: string, source: string): { text: string; line: number }[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: { text: string; line: number }[] = [];
  const push = (node: ts.Node, text: string) => {
    if (!/[a-z]{3,}\s+[a-z]/i.test(text)) return; // skip identifiers, class names, paths
    if (/^[\w\s:/.[\]()!-]+$/.test(text) && /\b(flex|grid|px-|py-|text-|bg-|rounded|size-)/.test(text)) return; // Tailwind classes
    out.push({ text, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isJsxText(node)) push(node, node.getText().trim());
    else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      // Skip regexes built from strings, object keys and `className` attributes.
      if (ts.isJsxAttribute(parent) && /^(className|href|src|id|key|name|type|role|aria-)/.test(parent.name.getText())) return;
      if (ts.isPropertyAssignment(parent) && parent.name === node) return;
      push(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      push(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" "));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map((d) => walk(path.join(root, d))))).flat().filter((f) => !SKIP.some((re) => re.test(f)));
  const findings: Finding[] = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const lines = source.split(/\r?\n/);
    for (const { text, line } of collectStrings(file, source)) {
      if (exempt(lines, line)) continue;
      for (const rule of RULES) if (rule.re.test(text)) findings.push({ file, line, rule, text });
    }
  }

  for (const rel of EXTRA_FILES) {
    const file = path.join(root, rel);
    const source = await readFile(file, "utf8").catch(() => "");
    source.split(/\r?\n/).forEach((text, i) => {
      for (const rule of RULES.filter((r) => r.id === "disease")) if (rule.re.test(text)) findings.push({ file, line: i + 1, rule, text: text.trim() });
    });
  }

  if (findings.length) {
    console.error(`check:copy found ${findings.length} issue(s):\n`);
    for (const f of findings) console.error(`  ${path.relative(root, f.file)}:${f.line}  [${f.rule.why}]  "${f.text.slice(0, 100)}"`);
    console.error("\nReword the copy, or add a `copy-check: <reason>` comment after a compliance review.");
    process.exit(1);
  }
  console.log(`check:copy passed (${files.length} files scanned).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
