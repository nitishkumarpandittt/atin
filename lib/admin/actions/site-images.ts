"use server";

import { z } from "zod";
import { db, schema } from "@/lib/db";
import { fail, guarded, ok, refreshSite, str, type ActionState } from "@/lib/admin/action-utils";
import { POSITIONS, getSiteImages, placementKeys, type SiteImage } from "@/lib/data/site-images";
import { deleteImage, storeImage } from "@/lib/uploads/store";

async function writeImages(next: Record<string, SiteImage>) {
  const value = JSON.stringify(next);
  await db.insert(schema.siteSettings).values({ key: "site-images", value }).onDuplicateKeyUpdate({ set: { value } });
}

const input = z.object({
  key: z.string().refine((k) => placementKeys.has(k), "Unknown image."),
  alt: z.string().trim().max(200, "Keep the description under 200 characters."),
  position: z.enum(POSITIONS),
});

/** Replaces a page photo (when a file is chosen) and/or updates its description and crop position. */
export async function saveSiteImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("editor", async () => {
    const parsed = input.safeParse({ key: str(fd, "key"), alt: str(fd, "alt"), position: str(fd, "position") || "center" });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check the form.");
    const { key, alt, position } = parsed.data;
    const images = { ...(await getSiteImages()) };
    const current = images[key];

    const file = fd.get("file");
    let filePath = current?.filePath;
    if (file instanceof File && file.size > 0) {
      // Banners run edge to edge, so keep up to 2400 px on the long side.
      const stored = await storeImage(file, "site", 2400).catch((e: Error) => e);
      if (stored instanceof Error) return fail(stored.message, { file: stored.message });
      if (current?.filePath) await deleteImage(current.filePath);
      filePath = stored.filePath;
    }
    if (!filePath) return fail("Choose a photo to upload.", { file: "Choose a photo to upload." });

    images[key] = { filePath, alt, position };
    await writeImages(images);
    refreshSite();
    return ok("Photo saved. The website has been updated.");
  });
}

/** Goes back to the built-in stock photo and deletes the uploaded file. */
export async function resetSiteImage(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("editor", async () => {
    const key = str(fd, "key");
    const images = { ...(await getSiteImages()) };
    const current = images[key];
    if (!current) return ok("Already using the default photo.");
    delete images[key];
    await writeImages(images);
    await deleteImage(current.filePath);
    refreshSite();
    return ok("Back to the default photo.");
  });
}
