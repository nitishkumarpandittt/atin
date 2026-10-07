import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logoWhite from "@/public/brand/atin-logo-white.png";
import type { Range } from "@/lib/data/catalogue";
import type { PublicCompany } from "@/lib/data/site";
import { site, telHref } from "@/lib/site/config";

const quickLinks = [
  { label: "About us", href: "/about" },
  { label: "All products", href: "/products" },
  { label: "Quality & certifications", href: "/quality-certifications" },
  { label: "Other divisions", href: "/divisions" },
  { label: "Contact", href: "/contact" },
];

const linkClass = "inline-block py-2 hover:text-white lg:py-1";

export function Footer({ ranges, company }: { ranges: Range[]; company: PublicCompany }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-navy-950 pb-[env(safe-area-inset-bottom)] text-white/75">
      <div className="hex-pattern absolute inset-0 opacity-40" aria-hidden />
      {/* Phones/tablets: brand, then quick links beside contact, then segments in two columns. Desktop: four columns. */}
      <div className="container-site relative grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:py-16 lg:grid-cols-[1.3fr_1fr_1.2fr_1.1fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <Image src={logoWhite} alt="Atin HealthCare" className="h-14 w-auto md:h-16" sizes="120px" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed md:mt-5">
            A pharmaceutical marketing and distribution company serving distributors, chemists, hospitals and institutions.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold !text-white">Quick links</h2>
          <ul className="mt-3 text-sm md:mt-4">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-last col-span-2 lg:order-none lg:col-span-1">
          <h2 className="text-base font-bold !text-white">Product segments</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 text-sm md:mt-4 md:grid-cols-3 lg:grid-cols-1">
            {ranges.map((r) => (
              <li key={r.slug}>
                <Link href={`/products/${r.slug}`} className={linkClass}>
                  {r.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold !text-white">Get in touch</h2>
          <ul className="mt-3 space-y-2 text-sm md:mt-4">
            {company.address && (
              <li className="flex gap-3 py-1">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
                <span>{company.address}</span>
              </li>
            )}
            {company.phone && (
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-2.5 size-4 shrink-0 text-leaf lg:mt-1.5" />
                <a href={telHref(company.phone)} className={linkClass}>
                  {company.phone}
                </a>
              </li>
            )}
            {company.email && (
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-2.5 size-4 shrink-0 text-leaf lg:mt-1.5" />
                <a href={`mailto:${company.email}`} className={`${linkClass} break-all`}>
                  {company.email}
                </a>
              </li>
            )}
            {company.hours && (
            <li className="flex gap-3 py-1">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
              <span>{company.hours}</span>
            </li>
            )}
            <li className="flex gap-3">
              <MessageCircle aria-hidden className="mt-2.5 size-4 shrink-0 text-leaf lg:mt-1.5" />
              <Link href="/contact" className={linkClass}>
                Send a trade enquiry
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col gap-2 pb-24 pt-6 text-xs sm:pb-6 md:flex-row md:items-center md:justify-between md:gap-6">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="max-w-2xl text-white/55 md:text-right">
            Product information is for trade reference only and is not medical advice.{" "}
            <Link href="/disclaimer" className="inline-block py-2 underline underline-offset-2 hover:text-white md:py-0">
              Disclaimer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
