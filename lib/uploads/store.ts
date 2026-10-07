import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { maxUploadBytes, resolveUpload, uploadRoot, type UploadFolder } from "@/lib/uploads/paths";

const ALLOWED = new Set(["jpeg", "png", "webp", "avif"]);

export type StoredImage = { filePath: string; width: number; height: number };

/**
 * Validates a real image, normalises it (rotate, fit `maxSize` px — 1600 by default, more for full-width
 * page banners — WebP q82, no metadata) and stores it under a random name.
 */
export async function storeImage(file: File, folder: UploadFolder, maxSize = 1600): Promise<StoredImage> {
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image to upload.");
  if (file.size > maxUploadBytes()) throw new Error(`Image is too large. The limit is ${Math.round(maxUploadBytes() / 1024 / 1024)} MB.`);

  const input = Buffer.from(await file.arrayBuffer());
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new Error("That file is not a supported image.");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new Error("Use a JPEG, PNG, WebP or AVIF image.");

  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const filePath = `${folder}/${randomUUID()}.webp`;
  const target = path.join(/*turbopackIgnore: true*/ uploadRoot(), filePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  return { filePath, width: info.width, height: info.height };
}

export async function deleteImage(filePath: string) {
  const full = resolveUpload(filePath);
  if (!full) return;
  await unlink(full).catch(() => {});
}
