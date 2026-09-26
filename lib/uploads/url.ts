/** Public URL for a stored upload path such as "products/<uuid>.webp". Absolute URLs pass through. */
export function uploadUrl(filePath: string): string {
  if (!filePath) return "";
  if (/^https?:\/\//.test(filePath) || filePath.startsWith("/")) return filePath;
  return `/uploads/${filePath}`;
}

/** Physician-facing visual aids (public/catalogue/visuals) carry indication claims and stay off the public site until SHOW_VISUAL_AIDS is on. */
export function isVisualAid(filePath: string): boolean {
  return filePath.startsWith("/catalogue/visuals/");
}
