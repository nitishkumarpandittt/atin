// Static site identity. Editable company details (contact, profile, director) live in the
// `site_settings` table and are read with getPublicCompany() from lib/data/site.ts.
// Public origin, without a trailing slash. An empty SITE_URL (a blank Vercel variable) counts as
// unset; on Vercel the deployment's own hostname is the fallback so previews get a valid metadataBase.
function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Atin HealthCare",
  legalName: "Atin HealthCare Pvt Ltd",
  url: siteUrl(),
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
