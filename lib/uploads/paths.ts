import "server-only";
import path from "node:path";

export const UPLOAD_FOLDERS = ["products", "site", "blog"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function uploadRoot(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads"));
}

const SAFE = /^(products|site|blog)\/[a-f0-9-]{36}\.webp$/;

/** Validates a stored relative path ("products/<uuid>.webp") and returns its absolute location, or null. */
export function resolveUpload(relative: string): string | null {
  if (!SAFE.test(relative)) return null;
  const root = uploadRoot();
  const full = path.resolve(/*turbopackIgnore: true*/ root, relative);
  return full.startsWith(root + path.sep) ? full : null;
}

export const maxUploadBytes = () => Math.max(1, Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024;
