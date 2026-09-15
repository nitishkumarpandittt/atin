// Company facts shown on the public site. Contact fields that are empty are hidden, never
// replaced with placeholder text. These move to the `site_settings` table with the admin panel.
export const site = {
  name: "Atin HealthCare",
  legalName: "Atin HealthCare Pvt Ltd",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  description:
    "Atin HealthCare is a pharmaceutical marketing and distribution company offering a multi-segment range of tablets, syrups, injectables, ayurvedic, dental, derma and eye-care products for the pharma trade.",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "",
  whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP ?? "",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "",
  hours: "Mon – Sat, 10:00 am – 6:30 pm",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Company profile", href: "/about" },
      { label: "Vision & mission", href: "/about#vision" },
      { label: "Quality & certifications", href: "/quality-certifications" },
    ],
  },
  { label: "Products", href: "/products", children: "ranges" as const },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
