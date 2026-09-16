// Draft public copy. Facts only: no disease, cure or superiority claims. To be reviewed by the
// client before launch; moves to the `site_settings` table with the admin panel.

export const companyProfile = [
  "Atin HealthCare Pvt Ltd is a pharmaceutical marketing and distribution company. We work with distributors, stockists, retail chemists, hospitals and institutional buyers, and make a broad, clearly organised product range available through a single trade relationship.",
  "Our catalogue covers tablets and capsules, syrups and suspensions, softgel capsules, injectables, an ayurvedic range, dental care, topical preparations, nutrition products, derma and personal care, and eye, ear and nasal drops. Every listing states the composition and pack size so partners can place orders with clarity.",
  "We focus on the practical side of the trade: accurate product information, consistent communication and prompt responses to enquiries.",
];

export const vision =
  "To be a dependable name for pharma trade partners across India, known for an organised portfolio and straightforward, transparent dealings.";

export const mission = [
  "Offer a wide, well-documented product range across segments and dosage forms.",
  "Keep product information accurate and easy to find for every trade partner.",
  "Respond to enquiries promptly and keep partners informed on availability.",
  "Share licences and product documentation with verified partners on request.",
];

export const values = [
  { title: "Clarity", text: "Composition and pack details stated plainly for every product." },
  { title: "Reliability", text: "Consistent communication with partners, from enquiry to dispatch." },
  { title: "Integrity", text: "Responsible, compliant product communication for the trade." },
  { title: "Partnership", text: "Long-term relationships with distributors, chemists and institutions." },
];

/** Director details stay hidden on the site until the client supplies them. */
export const director: { name: string; role: string; message: string[] } | null = null;

export const qualityPractices = [
  {
    title: "Documentation on request",
    text: "Trade licences, registrations and product documents are shared with verified partners on request.",
  },
  {
    title: "Accurate product information",
    text: "Catalogue data is taken from our master product list and reviewed before it is published.",
  },
  {
    title: "Storage and handling",
    text: "Products are handled and stored as per the conditions stated on each pack.",
  },
  {
    title: "Responsible communication",
    text: "Product listings are for trade reference. We do not make treatment claims or give medical advice.",
  },
];

export const disclaimer = [
  {
    heading: "Information for the trade",
    body: "The information on this website is provided by Atin HealthCare Pvt Ltd for registered medical practitioners, pharmacists, distributors and other trade partners. It is intended for general reference about our product portfolio and is not an offer for sale to the public.",
  },
  {
    heading: "Not medical advice",
    body: "Nothing on this website is medical advice or a recommendation to use any product. Medicines should be used only as prescribed by a registered medical practitioner. Patients should consult their doctor or pharmacist for any health-related question.",
  },
  {
    heading: "Product information",
    body: "Product names, compositions, pack sizes and images are shown for identification only and may change without notice. Always refer to the product pack and the approved prescribing information. Images may be representative and may not show the actual product or pack.",
  },
  {
    heading: "Prices and availability",
    body: "Listings do not indicate availability in any particular location. Prices, where shown, are indicative and subject to applicable regulations and change.",
  },
  {
    heading: "Third-party links and images",
    body: "Some photographs are licensed stock images used for illustration. Links to external websites are provided for convenience; we are not responsible for their content.",
  },
  {
    heading: "Limitation of liability",
    body: "While we make reasonable efforts to keep information accurate and current, Atin HealthCare Pvt Ltd makes no warranty as to its completeness or accuracy and is not liable for any loss arising from reliance on it.",
  },
  {
    heading: "Contact",
    body: "For questions about this website or our products, please use the enquiry form on our Contact page.",
  },
];
