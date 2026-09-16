import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { EmailStatus, EnquiryInput } from "@/lib/enquiries/store";

const configured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.ENQUIRY_TO_EMAIL);

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const LABELS: Partial<Record<keyof EnquiryInput, string>> = {
  name: "Name",
  organisation: "Organisation",
  role: "Role",
  phone: "Phone",
  email: "Email",
  city: "City",
  preferredTime: "Preferred time",
  productLabel: "Product",
  message: "Message",
};

export async function sendNotification(id: number | null, input: EnquiryInput): Promise<{ status: EmailStatus; error?: string }> {
  if (!configured()) return { status: "not-configured" };
  const label = input.kind === "callback" ? "Callback request" : "Trade enquiry";
  const rows = (Object.keys(LABELS) as (keyof EnquiryInput)[])
    .map((k) => [LABELS[k]!, String(input[k] ?? "")] as const)
    .filter(([, v]) => v);
  const ref = id ? `#${id}` : "(not saved)";
  try {
    await getTransporter().sendMail({
      from: process.env.ENQUIRY_FROM_EMAIL ?? process.env.SMTP_USER,
      to: process.env.ENQUIRY_TO_EMAIL,
      replyTo: input.email || undefined,
      subject: `${label} ${ref}: ${input.name}${input.organisation ? ` (${input.organisation})` : ""}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nReference: ${ref}`,
      html: `<h2>${label} ${ref}</h2><table cellpadding="6">${rows
        .map(([k, v]) => `<tr><th align="left">${escapeHtml(k)}</th><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
        .join("")}</table>`,
    });
    return { status: "sent" };
  } catch (error) {
    console.error("[enquiries] email failed", ref, error);
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}
