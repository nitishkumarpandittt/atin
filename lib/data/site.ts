import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { companyProfile, director, mission, vision } from "@/lib/site/content";
import { uploadUrl } from "@/lib/uploads/url";

export const companySchema = z.object({
  profile: z.string().default(""),
  vision: z.string().default(""),
  mission: z.string().default(""),
  directorName: z.string().default(""),
  directorRole: z.string().default(""),
  directorMessage: z.string().default(""),
  directorPhotoPath: z.string().default(""),
  registeredAddress: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  whatsappNumber: z.string().default(""),
  businessHours: z.string().default(""),
});

export type Company = z.infer<typeof companySchema>;

// Registered office details supplied by the client (also printed on the pack artwork).
// Environment variables override them; the admin's company record overrides both.
const contactDefaults = {
  registeredAddress: "SCO-3, First Floor, MDC, Sector-5, Panchkula, Haryana 134114",
  phone: "+91 95603 43063",
  email: "atinhealthcare@gmail.com",
  whatsappNumber: "+91 6239 702 595",
};

/** Defaults used until the company record is saved in the admin panel. */
export const companyDefaults: Company = {
  profile: companyProfile.join("\n\n"),
  vision,
  mission: mission.join("\n"),
  directorName: director?.name ?? "",
  directorRole: director?.role ?? "",
  directorMessage: director?.message.join("\n\n") ?? "",
  directorPhotoPath: "",
  registeredAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() || contactDefaults.registeredAddress,
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE?.trim() || contactDefaults.phone,
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL?.trim() || contactDefaults.email,
  whatsappNumber: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP?.trim() || contactDefaults.whatsappNumber,
  businessHours: "Mon – Sat, 10:00 am – 6:30 pm",
};

export const getCompany = cache(async (): Promise<Company> => {
  const [row] = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, "company")).limit(1);
  if (!row) return companyDefaults;
  try {
    // Fields left blank in the admin form fall back to the defaults rather than hiding the detail.
    const saved = Object.entries(JSON.parse(row.value) as Record<string, unknown>).filter(([, v]) => typeof v !== "string" || v.trim() !== "");
    return companySchema.parse({ ...companyDefaults, ...Object.fromEntries(saved) });
  } catch {
    return companyDefaults;
  }
});

/** Company details shaped for public rendering: paragraphs and lines split, empty values removed. */
export const getPublicCompany = cache(async () => {
  const c = await getCompany();
  const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const lines = (s: string) => s.split(/\n/).map((p) => p.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  return {
    profile: paras(c.profile),
    vision: c.vision.trim(),
    mission: lines(c.mission),
    director:
      c.directorName.trim() && c.directorMessage.trim()
        ? { name: c.directorName.trim(), role: c.directorRole.trim(), message: paras(c.directorMessage), photo: c.directorPhotoPath ? uploadUrl(c.directorPhotoPath) : "" }
        : null,
    address: c.registeredAddress.trim(),
    phone: c.phone.trim(),
    email: c.email.trim(),
    whatsapp: c.whatsappNumber.trim(),
    hours: c.businessHours.trim(),
  };
});

export type PublicCompany = Awaited<ReturnType<typeof getPublicCompany>>;

export const getPublishedCredentials = cache(async () =>
  db
    .select()
    .from(schema.credentials)
    .where(eq(schema.credentials.isPublished, true))
    .orderBy(asc(schema.credentials.sortOrder), asc(schema.credentials.id)),
);

/** Only testimonials with both permission and publication ticked are public. */
export const getPublishedTestimonials = cache(async () =>
  db
    .select()
    .from(schema.testimonials)
    .where(and(eq(schema.testimonials.isPublished, true), eq(schema.testimonials.hasPermission, true)))
    .orderBy(asc(schema.testimonials.sortOrder), asc(schema.testimonials.id)),
);
