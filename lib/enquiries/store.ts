import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export type EnquiryInput = {
  kind: "enquiry" | "callback";
  name: string;
  phone: string;
  organisation?: string;
  role?: string;
  email?: string;
  city?: string;
  preferredTime?: string;
  message?: string;
  productLabel?: string;
  productSlug?: string;
};

export type EmailStatus = "pending" | "sent" | "failed" | "not-configured";
export type WhatsAppStatus = "pending" | "sent" | "failed" | "not-configured";

/** Saves the enquiry and returns its id, or null when the database write failed. */
export async function saveEnquiry(input: EnquiryInput): Promise<number | null> {
  try {
    let productId: number | null = null;
    if (input.productSlug) {
      const [match] = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, input.productSlug)).limit(1);
      productId = match?.id ?? null;
    }
    const [res] = await db.insert(schema.enquiries).values({
      kind: input.kind,
      name: input.name,
      phone: input.phone,
      organisation: input.organisation ?? "",
      role: input.role ?? "",
      email: input.email || null,
      city: input.city ?? "",
      preferredTime: input.preferredTime ?? "",
      message: input.message ?? null,
      productId,
      productLabel: (input.productLabel ?? "").trim(),
    });
    return res.insertId;
  } catch (error) {
    console.error("[enquiries] could not save enquiry", error);
    return null;
  }
}

export async function saveEmailStatus(id: number, emailStatus: EmailStatus, emailError?: string) {
  try {
    await db
      .update(schema.enquiries)
      .set({ emailStatus, emailError: emailError?.slice(0, 500) ?? null })
      .where(eq(schema.enquiries.id, id));
  } catch (error) {
    console.error("[enquiries] could not save email status", id, error);
  }
}

export async function saveWhatsAppStatus(id: number, whatsappStatus: WhatsAppStatus, whatsappError?: string) {
  try {
    await db
      .update(schema.enquiries)
      .set({ whatsappStatus, whatsappError: whatsappError?.slice(0, 500) ?? null })
      .where(eq(schema.enquiries.id, id));
  } catch (error) {
    console.error("[enquiries] could not save whatsapp status", id, error);
  }
}
