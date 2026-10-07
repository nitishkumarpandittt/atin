"use server";

import { z } from "zod";
import { db, schema } from "@/lib/db";
import { bool, fail, guarded, ok, refreshSite, str, zodErrors, type ActionState } from "@/lib/admin/action-utils";
import { GA4_ID, META_PIXEL_ID, VERIFICATION_TOKEN, getPageOverrides, pageOverrideSchema } from "@/lib/data/seo";

// Accepts the bare token or the whole <meta name="google-site-verification" content="…"> tag.
const verificationToken = z
  .string()
  .trim()
  .transform((v) => v.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? v)
  .refine((v) => !v || VERIFICATION_TOKEN.test(v), "Paste the token or the full meta tag from Search Console.");

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || /^https:\/\/[^\s"'<>]+$/i.test(v) || /^\/[^\s"'<>]*$/.test(v), "Use a full https:// address or a site path starting with /.");

const settingsInput = z.object({
  googleVerification: verificationToken,
  bingVerification: verificationToken,
  ga4Id: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => !v || GA4_ID.test(v), "A GA4 Measurement ID looks like G-XXXXXXXXXX."),
  metaPixelId: z
    .string()
    .trim()
    .refine((v) => !v || META_PIXEL_ID.test(v), "A Meta Pixel ID is a number, e.g. 123456789012345."),
  ogImage: imageUrl,
});

/** Search Console, Bing, GA4, Meta Pixel and the default share image. Admins only: these add scripts to every page. */
export async function saveSeoSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("admin", async () => {
    const parsed = settingsInput.safeParse(Object.fromEntries(Object.keys(settingsInput.shape).map((k) => [k, str(fd, k)])));
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const value = JSON.stringify(parsed.data);
    await db.insert(schema.siteSettings).values({ key: "seo", value }).onDuplicateKeyUpdate({ set: { value } });
    refreshSite();
    return ok("Saved. The website has been updated.");
  });
}

const pageInput = z.object({
  path: z.string().trim().regex(/^\/[a-z0-9\-/]*$/, "Unknown page."),
  title: z.string().trim().max(120, "Keep the title under 120 characters (about 60 show in Google)."),
  description: z.string().trim().max(320, "Keep the description under 320 characters (about 155 show in Google)."),
  ogImage: imageUrl,
  noIndex: z.boolean(),
});

async function writeOverrides(next: Record<string, z.infer<typeof pageOverrideSchema>>) {
  const value = JSON.stringify(next);
  await db.insert(schema.siteSettings).values({ key: "seo-pages", value }).onDuplicateKeyUpdate({ set: { value } });
}

/** Saves one page's override; an all-empty override is removed so the page goes back to its defaults. */
export async function savePageSeo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("editor", async () => {
    const parsed = pageInput.safeParse({ path: str(fd, "path"), title: str(fd, "title"), description: str(fd, "description"), ogImage: str(fd, "ogImage"), noIndex: bool(fd, "noIndex") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    const { path, ...override } = parsed.data;
    const current = { ...(await getPageOverrides()) };
    if (!override.title && !override.description && !override.ogImage && !override.noIndex) delete current[path];
    else current[path] = override;
    await writeOverrides(current);
    refreshSite();
    return ok("Saved. The page has been updated.");
  });
}

export async function resetPageSeo(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("editor", async () => {
    const path = str(fd, "path");
    const current = { ...(await getPageOverrides()) };
    delete current[path];
    await writeOverrides(current);
    refreshSite();
    return ok("Back to the automatic title and description.");
  });
}
