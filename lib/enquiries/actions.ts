"use server";

import { headers } from "next/headers";
import { callbackSchema, enquirySchema, toFieldErrors, type FormState } from "@/lib/enquiries/schema";
import { rateLimit } from "@/lib/enquiries/rate-limit";
import { saveEmailStatus, saveEnquiry, saveWhatsAppStatus, type EnquiryInput } from "@/lib/enquiries/store";
import { sendNotification } from "@/lib/enquiries/mail";
import { sendEnquiryWhatsApp } from "@/lib/enquiries/whatsapp";

const MIN_FILL_MS = 3000;

async function clientKey() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
}

const fields = (formData: FormData, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, typeof formData.get(k) === "string" ? (formData.get(k) as string) : undefined]));

async function persist(input: EnquiryInput) {
  // Save first so no enquiry is lost if a notification fails; success if any path worked.
  // Email and WhatsApp run side by side and never throw, so one failing cannot delay or block the other.
  const id = await saveEnquiry(input);
  const [mail, whatsapp] = await Promise.all([sendNotification(id, input), sendEnquiryWhatsApp({ ...input, id })]);
  if (id) await Promise.all([saveEmailStatus(id, mail.status, mail.error), saveWhatsAppStatus(id, whatsapp.status, whatsapp.error)]);
  return id !== null || mail.status === "sent" || whatsapp.status === "sent";
}

// Order: field validation first, then honeypot and timing, then rate limit (only counts valid input).
export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = enquirySchema.safeParse(fields(formData, ["name", "organisation", "role", "email", "phone", "city", "message", "product", "consent"]));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  if (String(formData.get("leave_this_blank") ?? "") !== "") {
    return { status: "success", message: "Thank you. Your enquiry has been sent." };
  }
  const startedAt = Number(formData.get("started_at"));
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "error", message: "That was very quick. Please check your details and send again." };
  }
  if (!rateLimit(`enquiry:${await clientKey()}`)) {
    return { status: "error", message: "Too many enquiries from this connection. Please try again in a few minutes." };
  }

  const { name, organisation, role, email, phone, city, message, product } = parsed.data;
  const productSlug = String(formData.get("product_slug") ?? "").slice(0, 160);
  const ok = await persist({ kind: "enquiry", name, organisation, role, email, phone, city, message, productLabel: product, productSlug: /^[a-z0-9-]+$/.test(productSlug) ? productSlug : undefined });
  return ok
    ? { status: "success", message: "Thank you. Your enquiry has been received and our team will get back to you." }
    : { status: "error", message: "We could not send your enquiry right now. Please try again shortly." };
}

export async function submitCallback(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = callbackSchema.safeParse(fields(formData, ["name", "phone", "organisation", "preferredTime"]));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  if (String(formData.get("leave_this_blank") ?? "") !== "") {
    return { status: "success", message: "Thank you. We will call you back." };
  }
  const startedAt = Number(formData.get("started_at"));
  if (!startedAt || Date.now() - startedAt < 1500) {
    return { status: "error", message: "That was very quick. Please check your details and send again." };
  }
  if (!rateLimit(`callback:${await clientKey()}`, 3)) {
    return { status: "error", message: "Too many requests from this connection. Please try again in a few minutes." };
  }

  const ok = await persist({ kind: "callback", ...parsed.data });
  return ok
    ? { status: "success", message: "Thank you. Our team will call you back during business hours." }
    : { status: "error", message: "We could not send your request right now. Please try again shortly." };
}
