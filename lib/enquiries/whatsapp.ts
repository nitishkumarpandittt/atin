import "server-only";
// The sending code lives in whatsapp-providers.ts (no "server-only") so scripts/whatsapp-test.ts can
// import it; app code imports from here so it can never reach a client bundle.
export { sendEnquiryWhatsApp } from "@/lib/enquiries/whatsapp-providers";
