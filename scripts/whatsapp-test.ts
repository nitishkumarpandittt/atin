// Sends one obviously-fake enquiry notification through the WhatsApp provider in .env.local.
//   npm run whatsapp:test
// Exits 1 unless every number in WHATSAPP_NOTIFY_TO was reached.
import { loadEnvConfig } from "@next/env";
import { sendEnquiryWhatsApp } from "../lib/enquiries/whatsapp-providers";

loadEnvConfig(process.cwd());

async function main() {
  const provider = process.env.WHATSAPP_PROVIDER || "";
  const to = process.env.WHATSAPP_NOTIFY_TO || "";
  console.log(`Provider: ${provider || "(blank)"}   To: ${to || "(blank)"}`);

  const result = await sendEnquiryWhatsApp({
    id: null,
    kind: "enquiry",
    name: "Test enquiry",
    organisation: "Test organisation",
    role: "Other trade enquiry",
    email: "test@example.com",
    phone: "0000000000",
    city: "Test city",
    productLabel: "Test product",
    message: "This is a test message from `npm run whatsapp:test`. Please ignore it.",
  });

  if (result.status === "sent") {
    console.log("WhatsApp test message sent.");
    return;
  }
  if (result.status === "not-configured") {
    console.error(
      "WhatsApp is not configured. Set WHATSAPP_PROVIDER (meta or twilio), WHATSAPP_NOTIFY_TO and the provider's own variables in .env.local (see .env.example).",
    );
  } else {
    console.error(`WhatsApp test failed: ${result.error ?? result.status}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
