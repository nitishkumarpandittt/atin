import type { Metadata } from "next";
import { pageMeta } from "@/lib/site/seo";
import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { RequestCallButton } from "@/components/site/RequestCallButton";
import { telHref } from "@/lib/site/config";
import { getProductBySlug } from "@/lib/data/catalogue";
import { getPublicCompany } from "@/lib/data/site";
import { productTitle } from "@/lib/utils/text";
import { photo } from "@/lib/site/photos";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Send a trade enquiry to Atin HealthCare or request a call back from our team.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const raw = typeof sp.product === "string" ? sp.product.slice(0, 160) : "";
  // ?product= is either a catalogue slug (from a product page) or free text (e.g. a segment name).
  const [company, match] = await Promise.all([getPublicCompany(), /^[a-z0-9-]+$/.test(raw) ? getProductBySlug(raw) : null]);
  const product = match ? productTitle(match.brand, match.dosageForm) : raw || undefined;
  const support = photo("contact");

  const details = [
    company.phone && { icon: Phone, label: "Phone", value: company.phone, href: telHref(company.phone) },
    company.email && { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
    company.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: company.whatsapp, href: `https://wa.me/${company.whatsapp.replace(/\D/g, "")}` },
    company.address && { icon: MapPin, label: "Address", value: company.address },
    company.hours && { icon: Clock, label: "Business hours", value: company.hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to our trade team"
        intro="Send an enquiry about products, availability or partnership, or ask us to call you back."
        photo={support}
        overlap
        crumbs={[{ label: "Contact" }]}
      />

      <section className="container-site relative z-10 -mt-24 pb-14 md:pb-20 lg:pb-28">
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line md:rounded-[2rem] lg:grid-cols-[0.85fr_1.15fr]">
          {/* Details panel on photo */}
          <div className="relative isolate overflow-hidden bg-navy p-6 text-white sm:p-8 md:p-10">
            {support && <Image src={support.src} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="-z-20 object-cover" />}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/95 via-brand/90 to-navy/95" />
            <div aria-hidden className="hex-pattern absolute inset-0 -z-10" />
            <h2 className="text-2xl font-bold !text-white">Contact details</h2>
            <p className="mt-2 text-white/80">We respond to trade enquiries during business hours.</p>
            <ul className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-1">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-white/65">{label}</span>
                    {href ? (
                      <a href={href} className="font-medium hover:underline" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {value}
                      </a>
                    ) : (
                      <span className="block font-medium">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm md:mt-10">
              <p className="font-semibold">Prefer a phone call?</p>
              <p className="mt-1 text-sm text-white/75">Leave your number and we will call you back.</p>
              <RequestCallButton className="btn btn-white mt-4 w-full sm:w-auto" />
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-10">
            <p className="eyebrow text-green">Trade enquiry</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Send us your requirement</h2>
            <p className="mb-6 mt-2 text-muted md:mb-8">Fields marked * are required.</p>
            <EnquiryForm product={product} productSlug={match?.slug} />
          </div>
        </div>
      </section>
    </>
  );
}
