import { z } from "zod";

export const ROLES = ["Distributor / stockist", "Retail chemist", "Hospital / clinic", "Institutional buyer", "Other trade enquiry"] as const;

const phone = z
  .string()
  .trim()
  .min(1, "Please enter a phone number.")
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => /^\+?\d{10,13}$/.test(v), "Enter a valid phone number (10 digits, optionally with country code).");

const name = z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long.");

export const enquirySchema = z.object({
  name,
  organisation: z.string().trim().min(2, "Please enter your organisation or firm name.").max(120),
  role: z.enum(ROLES, { message: "Please choose what describes you best." }),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address or leave it blank."),
  phone,
  city: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Please add a short message (at least 10 characters).").max(2000, "Message is too long."),
  product: z.string().trim().max(160).optional().default(""),
  consent: z.literal("on", { message: "Please confirm this is a trade enquiry." }),
});

export const callbackSchema = z.object({
  name,
  phone,
  organisation: z.string().trim().max(120).optional().default(""),
  preferredTime: z.enum(["Any time", "Morning", "Afternoon", "Evening"]).default("Any time"),
});

export type FieldErrors = Partial<Record<string, string>>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "success"; message: string };

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
