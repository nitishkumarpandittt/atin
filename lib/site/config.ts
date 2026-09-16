// Static site identity. Editable company details (contact, profile, director) live in the
// `site_settings` table and are read with getPublicCompany() from lib/data/site.ts.
export const site = {
  name: "Atin HealthCare",
  legalName: "Atin HealthCare Pvt Ltd",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  description:
    "Atin HealthCare is a pharmaceutical marketing and distribution company offering a multi-segment range of tablets, syrups, injectables, ayurvedic, dental, derma and eye-care products for the pharma trade.",
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
