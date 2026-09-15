// Shared by the server search route and the browser-side catalogue filter.
// Tolerates "10 x 10" / "10x10" / "10*10", "Alu-Alu" / "alu alu", dots and case.
export function normaliseSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(\d)\s*[x×*]\s*(?=\d)/g, "$1x")
    .replace(/(\d)\s+(mg|mcg|ml|gm|g|iu)\b/g, "$1$2")
    .replace(/[^a-z0-9%/.x]+/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesAllTerms(haystack: string, query: string): boolean {
  const terms = normaliseSearch(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const h = normaliseSearch(haystack);
  return terms.every((t) => h.includes(t));
}
