import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { EnquiryRecord } from "@/lib/enquiries/store";

const configured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.ENQUIRY_TO_EMAIL);

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

export async function sendNotification(record: EnquiryRecord): Promise<EnquiryRecord["emailStatus"]> {
  if (!configured()) return "not-configured";
  const label = record.kind === "callback" ? "Callback request" : "Trade enquiry";
  const rows = Object.entries(record.data).filter(([, v]) => v);
  try {
    await getTransporter().sendMail({
      from: process.env.ENQUIRY_FROM_EMAIL ?? process.env.SMTP_USER,
      to: process.env.ENQUIRY_TO_EMAIL,
      replyTo: record.data.email || undefined,
      subject: `${label}: ${record.data.name}${record.data.organisation ? ` (${record.data.organisation})` : ""}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nReceived: ${record.createdAt}\nID: ${record.id}`,
      html: `<h2>${label}</h2><table cellpadding="6">${rows
        .map(([k, v]) => `<tr><th align="left">${escapeHtml(k)}</th><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
        .join("")}</table><p style="color:#666">Received ${record.createdAt} · ID ${record.id}</p>`,
    });
    return "sent";
  } catch (error) {
    console.error("[enquiries] email failed", record.id, error);
    return "failed";
  }
}
