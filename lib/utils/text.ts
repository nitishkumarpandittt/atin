/** True when the brand already names its form (e.g. "Carbross Eye Drop" + "Eye Drops"). */
export function brandIncludesForm(brand: string, dosageForm: string): boolean {
  const words = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean).map((w) => w.replace(/s$/, ""));
  const b = words(brand).join(" ");
  const f = words(dosageForm).join(" ");
  return Boolean(f) && b.includes(f);
}

/** "Acloage-P Tablet", but "Carbross Eye Drop" rather than "Carbross Eye Drop Eye Drops". */
export function productTitle(brand: string, dosageForm: string): string {
  return brandIncludesForm(brand, dosageForm) ? brand : `${brand} ${dosageForm}`;
}
