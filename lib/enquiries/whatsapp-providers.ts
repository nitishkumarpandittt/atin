// WhatsApp notification for new enquiries, sent to the company's own number(s) through either the
// WhatsApp Cloud API ("meta") or Twilio. No "server-only" here so scripts/whatsapp-test.ts can import
// it; app code goes through ./whatsapp.ts. Uses the global fetch, so no SDK is needed.
import type { EnquiryInput, WhatsAppStatus } from "@/lib/enquiries/store";

// Test-only overrides so a local server can stand in for the real APIs; leave them unset in production.
const metaApiBase = () => process.env.WHATSAPP_API_BASE || "https://graph.facebook.com/v21.0";
const twilioApiBase = () => process.env.TWILIO_API_BASE || "https://api.twilio.com";

const TIMEOUT_MS = 10_000;
const MAX_ERROR = 500;

type Config =
  | { provider: "meta"; to: string[]; phoneNumberId: string; accessToken: string; template: string; lang: string }
  | { provider: "twilio"; to: string[]; accountSid: string; authToken: string; from: string; contentSid?: string };

const digits = (s: string) => s.replace(/\D/g, "");

/** Returns null unless WHATSAPP_PROVIDER and everything that provider needs is set (like SMTP in mail.ts). */
function readConfig(): Config | null {
  const env = process.env;
  const to = (env.WHATSAPP_NOTIFY_TO ?? "").split(",").map(digits).filter(Boolean);
  if (!to.length) return null;
  if (env.WHATSAPP_PROVIDER === "meta" && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN) {
    return {
      provider: "meta",
      to,
      phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: env.WHATSAPP_ACCESS_TOKEN,
      template: env.WHATSAPP_TEMPLATE_NAME || "enquiry_received",
      lang: env.WHATSAPP_TEMPLATE_LANG || "en",
    };
  }
  if (env.WHATSAPP_PROVIDER === "twilio" && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM) {
    return {
      provider: "twilio",
      to,
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      from: `whatsapp:+${digits(env.TWILIO_WHATSAPP_FROM)}`,
      contentSid: env.TWILIO_CONTENT_SID || undefined,
    };
  }
  return null;
}

const kindLabel = (kind: EnquiryInput["kind"]) => (kind === "callback" ? "Call-back request" : "Trade enquiry");

/** Meta rejects template parameters containing newlines, tabs or more than four consecutive spaces. */
const clean = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();

/**
 * The five body variables ({{1}}–{{5}}) of the approved template; the same set is used for a Twilio
 * content template. Every value is non-empty, since Meta rejects blank parameters.
 */
export function templateVariables(input: EnquiryInput): [string, string, string, string, string] {
  const where = [clean(input.organisation), clean(input.city)].filter(Boolean).join(", ");
  const summary = clean(input.productLabel) || clean(input.message).slice(0, 100) || clean(input.preferredTime);
  return [kindLabel(input.kind), clean(input.name) || "—", clean(input.phone) || "—", where || "—", summary || "—"];
}

/** Plain-text message used by Twilio when no content template is configured (sandbox / open 24h session). */
export function textBody(input: EnquiryInput & { id: number | null }): string {
  const rows: [string, string | undefined][] = [
    ["Name", input.name],
    ["Phone", input.phone],
    ["Organisation", input.organisation],
    ["City", input.city],
    ["Product", input.productLabel],
    ["Message", input.message],
    ["Preferred time", input.preferredTime],
  ];
  return [
    `New ${kindLabel(input.kind).toLowerCase()} on the website`,
    ...rows.filter(([, v]) => v?.trim()).map(([k, v]) => `${k}: ${v!.trim()}`),
    ...(input.id ? [`Reference: #${input.id}`] : []),
  ].join("\n");
}

/** Pulls message and code out of a Meta ({ error: { message, code } }) or Twilio ({ message, code }) error body. */
function providerError(body: string): string {
  let json: { error?: { message?: string; code?: unknown }; message?: string; code?: unknown } | null = null;
  try {
    json = JSON.parse(body);
  } catch {
    json = null;
  }
  const err = json?.error ?? json;
  if (err?.message) return err.code != null ? `${err.message} (code ${err.code})` : err.message;
  return clean(body) || "no response body";
}

/** POSTs and returns null on a 2xx response, otherwise a short error description. Never throws. */
async function request(url: string, init: RequestInit): Promise<string | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.ok) return null;
    const body = await res.text().catch(() => "");
    return `HTTP ${res.status}: ${providerError(body)}`.slice(0, MAX_ERROR);
  } catch (error) {
    // Node reports network errors as "fetch failed" with the real reason (ECONNREFUSED, ENOTFOUND...) in cause.
    const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    return (error instanceof Error ? `${error.name}: ${error.message}${cause}` : String(error)).slice(0, MAX_ERROR);
  }
}

function sendMeta(cfg: Extract<Config, { provider: "meta" }>, to: string, vars: string[]) {
  return request(`${metaApiBase()}/${cfg.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: cfg.template,
        language: { code: cfg.lang },
        components: [{ type: "body", parameters: vars.map((text) => ({ type: "text", text })) }],
      },
    }),
  });
}

function sendTwilio(cfg: Extract<Config, { provider: "twilio" }>, to: string, vars: string[], body: string) {
  const form = new URLSearchParams({ From: cfg.from, To: `whatsapp:+${to}` });
  if (cfg.contentSid) {
    form.set("ContentSid", cfg.contentSid);
    form.set("ContentVariables", JSON.stringify(Object.fromEntries(vars.map((v, i) => [String(i + 1), v]))));
  } else {
    form.set("Body", body);
  }
  return request(`${twilioApiBase()}/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
}

/**
 * Notifies every number in WHATSAPP_NOTIFY_TO. "sent" only when all of them succeeded; otherwise
 * "failed" with the first error. Never throws. Only status codes and provider error text are logged,
 * never the message itself (customer details).
 */
export async function sendEnquiryWhatsApp(input: EnquiryInput & { id: number | null }): Promise<{ status: WhatsAppStatus; error?: string }> {
  const cfg = readConfig();
  if (!cfg) return { status: "not-configured" };
  const vars = templateVariables(input);
  const ref = input.id ? `#${input.id}` : "(not saved)";
  const results = await Promise.all(
    cfg.to.map((to) => (cfg.provider === "meta" ? sendMeta(cfg, to, vars) : sendTwilio(cfg, to, vars, textBody(input)))),
  );
  const error = results.find((e) => e !== null);
  if (error === undefined) return { status: "sent" };
  console.error("[enquiries] whatsapp failed", ref, error);
  return { status: "failed", error };
}
