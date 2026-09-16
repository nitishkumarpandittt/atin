import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, FileText, PackageCheck, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { qualityPractices } from "@/lib/site/content";
import { photo } from "@/lib/site/photos";
import { getPublishedCredentials } from "@/lib/data/site";
import { formatDate } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Quality & certifications",
  description: "How Atin HealthCare handles product information and documentation, and how to request licences and certificates.",
};


const practiceIcons = [FileText, ClipboardCheck, PackageCheck, ShieldCheck];

export default async function QualityPage() {
  const credentials = await getPublishedCredentials();
  const lab = photo("lab-quality");
  const storage = photo("blog-2");

  return (
    <>
      <PageHero
        eyebrow="Quality"
        title="Quality & certifications"
        intro="Accurate product information, careful handling and documentation that trade partners can rely on."
        photo={lab}
        crumbs={[{ label: "About", href: "/about" }, { label: "Quality & certifications" }]}
      />

      <section className="py-14 md:py-20 lg:py-28">
        <div className="container-site grid items-center gap-10 md:gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Our approach" title="How we handle quality in the trade" />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-10">
              {qualityPractices.map((q, i) => {
                const Icon = practiceIcons[i % practiceIcons.length];
                return (
                  <li key={q.title} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                    <span className={`grid size-12 place-items-center rounded-xl ${i % 2 ? "bg-leaf-100 text-green" : "bg-sky-100 text-brand"}`}>
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold">{q.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{q.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative" data-reveal>
            <div aria-hidden className="absolute -right-4 -top-4 bottom-12 left-12 hidden rounded-[2rem] bg-surface sm:block md:-right-6 md:-top-6" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift sm:aspect-[16/9] md:rounded-[2rem] lg:aspect-[4/5]">
              {storage && <Image src={storage.src} alt={storage.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 md:py-20 lg:py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Licences & registrations" title="Certificates and documentation" />
          {credentials.length > 0 ? (
            <div className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-line">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-navy text-white">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Licence / registration</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Issuing authority</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Number</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Valid until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {credentials.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-4 font-medium text-navy">{c.name}</td>
                      <td className="px-5 py-4 text-muted">{c.issuingAuthority || "—"}</td>
                      <td className="px-5 py-4 font-mono text-ink">{c.number || "—"}</td>
                      <td className="px-5 py-4 text-muted">{c.validUntil ? formatDate(c.validUntil) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-8 grid items-center gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:gap-6 sm:p-8 md:mt-10 lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:p-10">
              <span className="grid size-16 place-items-center rounded-2xl bg-sky-100 text-brand">
                <BadgeCheck aria-hidden className="size-8" />
              </span>
              <div>
                <h3 className="text-xl font-bold">Details available on request</h3>
                <p className="mt-2 max-w-2xl text-muted">
                  Copies of our trade licences, registrations and product documentation are shared with verified distributors, chemists and
                  institutions. Send us an enquiry with your firm details.
                </p>
              </div>
              <Link href="/contact?product=Licence%20and%20documentation%20request" className="btn btn-green w-full sm:w-auto sm:justify-self-start">
                Request documents <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
