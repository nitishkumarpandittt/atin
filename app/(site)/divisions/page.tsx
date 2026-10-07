import type { Metadata } from "next";
import { seoMeta, staticPages } from "@/lib/data/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { divisions } from "@/lib/site/divisions";
import { site } from "@/lib/site/config";
import { sitePhoto } from "@/lib/data/site-images";

export async function generateMetadata(): Promise<Metadata> {
  return seoMeta(staticPages["/divisions"]);
}

export default async function DivisionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Group companies"
        title="Other divisions"
        intro={`${site.name} is one of several pharmaceutical companies under common management. Each division runs its own portfolio and website.`}
        photo={await sitePhoto("divisions-hero")}
        crumbs={[{ label: "Other divisions" }]}
      />

      <section className="container-site py-12 md:py-16 lg:py-20">
        <SectionHeading eyebrow="Our group" title="Sister companies" intro="Select a division to open its website in a new tab." />

        <ul className="mt-8 grid gap-4 sm:gap-5 md:mt-12 md:grid-cols-2 xl:grid-cols-3">
          {divisions.map((d, i) => (
            <li key={d.domain} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift hover:ring-sky/40">
                {/* Logos vary in shape, so each sits centred on a white stage with generous padding. */}
                <div className="relative flex h-40 items-center justify-center border-b border-line bg-white px-8 sm:h-44">
                  <span aria-hidden className={`absolute inset-0 ${i % 2 ? "bg-leaf-100/40" : "bg-sky-100/50"}`} />
                  <Image src={d.logo} alt={d.logoAlt} width={320} height={120} sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 80vw" className="relative max-h-24 w-auto object-contain mix-blend-multiply transition duration-500 group-hover:scale-105 sm:max-h-28" />
                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white text-brand shadow-card ring-1 ring-line transition group-hover:bg-brand group-hover:text-white">
                    <ArrowUpRight aria-hidden className="size-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-bold leading-snug sm:text-xl">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
                      {d.name}
                    </a>
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                    <MapPin aria-hidden className="size-3.5 shrink-0 text-green" /> {d.location}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{d.description}</p>
                  <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-brand">
                    <span className="truncate">{d.domain}</span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      Visit website <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted md:mt-10">
          Each website is operated by the division named on it. For {site.name} products and trade enquiries, see{" "}
          <Link href="/products" className="font-semibold text-brand hover:underline">
            our catalogue
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold text-brand hover:underline">
            contact us
          </Link>
          .
        </p>
      </section>
    </>
  );
}
