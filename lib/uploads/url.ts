/** Public URL for a stored upload path such as "products/<uuid>.webp". Absolute URLs pass through. */
export function uploadUrl(filePath: string): string {
  if (!filePath) return "";
  if (/^https?:\/\//.test(filePath) || filePath.startsWith("/")) return filePath;
  return `/uploads/${filePath}`;
}
