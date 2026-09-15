import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logoWhite from "@/public/brand/atin-logo-white.png";
import type { Range } from "@/lib/data/catalogue";
import { site, telHref } from "@/lib/site/config";

const quickLinks = [
  { label: "About us", href: "/about" },
  { label: "All products", href: "/products" },
  { label: "Quality & certifications", href: "/quality-certifications" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Footer({ ranges }: { ranges: Range[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-navy-950 text-white/75">
      <div className="hex-pattern absolute inset-0 opacity-40" aria-hidden />
      <div className="container-site relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.1fr]">
        <div>
          <Image src={logoWhite} alt="Atin HealthCare" className="h-16 w-auto" sizes="120px" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            A pharmaceutical marketing and distribution company serving distributors, chemists, hospitals and institutions.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold !text-white">Quick links</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold !text-white">Product segments</h2>
          <ul className="mt-5 grid gap-2.5 text-sm">
            {ranges.map((r) => (
              <li key={r.slug}>
                <Link href={`/products/${r.slug}`} className="hover:text-white">
                  {r.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold !text-white">Get in touch</h2>
          <ul className="mt-5 space-y-3.5 text-sm">
            {site.address && (
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
                <span>{site.address}</span>
              </li>
            )}
            {site.phone && (
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
                <a href={telHref(site.phone)} className="hover:text-white">
                  {site.phone}
                </a>
              </li>
            )}
            {site.email && (
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
              <span>{site.hours}</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-leaf" />
              <Link href="/contact" className="hover:text-white">
                Send a trade enquiry
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-xs md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="max-w-2xl text-white/55 md:text-right">
            Product information is for trade reference only and is not medical advice.{" "}
            <Link href="/disclaimer" className="underline underline-offset-2 hover:text-white">
              Disclaimer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
