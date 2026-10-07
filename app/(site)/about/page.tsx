import type { Metadata } from "next";
import { seoMeta, staticPages } from "@/lib/data/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Handshake, Eye, ShieldCheck, Target, Sparkles, CircleCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { CountUp } from "@/components/motion/CountUp";
import { RequestCallButton } from "@/components/site/RequestCallButton";
import { getCatalogueFigures, getRanges } from "@/lib/data/catalogue";
import { values } from "@/lib/site/content";
import { getPublicCompany } from "@/lib/data/site";
import { sitePhoto } from "@/lib/data/site-images";

export async function generateMetadata(): Promise<Metadata> {
  return seoMeta(staticPages["/about"]);
}

const valueIcons = [Compass, ShieldCheck, Sparkles, Handshake];

export default async function AboutPage() {
  const [figures, ranges, company] = await Promise.all([getCatalogueFigures(), getRanges(), getPublicCompany()]);
  const { profile: companyProfile, vision, mission, director } = company;
  const [team, warehouse, counter, band] = await Promise.all([sitePhoto("about-hero"), sitePhoto("about-profile"), sitePhoto("about-profile-small"), sitePhoto("about-band")]);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A pharma marketing and distribution partner for the trade"
        intro="We bring a broad, well-organised product portfolio to distributors, chemists, hospitals and institutions."
        photo={team}
        crumbs={[{ label: "About us" }]}
      />

      {/* Company profile: Pavilion offset photo panel */}
      <section id="profile" className="scroll-mt-24 py-14 md:py-20 lg:py-28">
        <div className="container-site grid items-center gap-10 md:gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1" data-reveal>
            <div aria-hidden className="absolute -bottom-6 -left-5 right-16 top-16 rounded-[2rem] bg-surface md:-bottom-8 md:-left-8" />
            <div aria-hidden className="dot-grid absolute -right-2 -top-6 h-28 w-40 opacity-70" />
            <div className="relative mx-auto grid max-w-xl grid-cols-5 gap-3 sm:gap-4 lg:max-w-none">
              <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-3xl shadow-lift">
                {warehouse && <Image src={warehouse.src} alt={warehouse.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" style={{ objectPosition: warehouse.position }} />}
              </div>
              <div className="col-span-2 flex flex-col gap-3 pt-10 sm:gap-4 sm:pt-16">
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-card">
                  {counter && <Image src={counter.src} alt={counter.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" style={{ objectPosition: counter.position }} />}
                </div>
                <div className="rounded-2xl bg-brand p-3 text-white shadow-card sm:rounded-3xl sm:p-5">
                  <p className="font-display text-3xl font-extrabold sm:text-4xl">
                    <CountUp value={figures.products} />
                  </p>
                  <p className="mt-1 text-xs leading-snug text-white/80 sm:text-sm">products in the catalogue</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="Company profile" title="Who we are" />
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted md:mt-6 md:text-lg" data-reveal>
              {companyProfile.length ? (
                companyProfile.map((p) => <p key={p.slice(0, 24)}>{p}</p>)
              ) : (
                <p>Atin HealthCare is a pharmaceutical marketing and distribution company serving the pharma trade.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Figures band */}
      <section aria-label="Catalogue figures" className="relative overflow-hidden bg-brand py-10 md:py-14">
        <div aria-hidden className="hex-pattern absolute inset-0" />
        <ul className="container-site relative grid grid-cols-3 gap-3 text-center text-white sm:gap-8">
          {[
            { v: figures.products, l: "Products" },
            { v: figures.ranges, l: "Product segments" },
            { v: figures.dosageForms, l: "Dosage forms & formats" },
          ].map((s) => (
            <li key={s.l}>
              <p className="font-display text-[2rem] font-extrabold leading-none sm:text-5xl md:text-6xl">
                <CountUp value={s.v} />
              </p>
              <p className="mt-2 text-xs font-medium uppercase leading-snug tracking-wide text-white/75 sm:text-sm sm:tracking-wider">{s.l}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Vision & mission */}
      <section id="vision" className="scroll-mt-24 py-14 md:py-20 lg:py-28">
        <div className="container-site">
          <SectionHeading align="center" eyebrow="Vision & mission" title="What guides our work" />
          {(vision || mission.length > 0) && (
          <div className={`mt-10 grid gap-4 sm:gap-6 md:mt-14 ${vision && mission.length ? "lg:grid-cols-2" : ""}`}>
            {vision && (
            <article className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-8 md:rounded-[2rem] md:p-10" data-reveal>
              <div aria-hidden className="hex-pattern absolute inset-0" />
              <span className="relative grid size-14 place-items-center rounded-2xl bg-white/10">
                <Eye aria-hidden className="size-7" />
              </span>
              <h3 className="relative mt-6 text-2xl font-bold !text-white">Our vision</h3>
              <p className="relative mt-4 text-lg leading-relaxed text-white/85">{vision}</p>
            </article>
            )}
            {mission.length > 0 && (
            <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8 md:rounded-[2rem] md:p-10" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
              <span className="grid size-14 place-items-center rounded-2xl bg-leaf-100 text-green">
                <Target aria-hidden className="size-7" />
              </span>
              <h3 className="mt-6 text-2xl font-bold">Our mission</h3>
              <ul className="mt-5 space-y-3">
                {mission.map((m) => (
                  <li key={m} className="flex gap-3 text-ink">
                    <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-green" />
                    {m}
                  </li>
                ))}
              </ul>
            </article>
            )}
          </div>
          )}

          <ul className="mt-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:mt-6 sm:gap-6 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <li key={v.title} className="rounded-2xl bg-surface p-4 sm:rounded-3xl sm:p-6" data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                  <Icon aria-hidden className="size-6 text-brand" />
                  <h3 className="mt-3 text-base font-bold sm:mt-4 sm:text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {director && (
        <section id="director" className="scroll-mt-24 bg-surface py-14 md:py-20 lg:py-28">
          <div className={`container-site grid items-start gap-8 md:gap-12 ${director.photo ? "lg:grid-cols-[20rem_1fr]" : "max-w-4xl"}`}>
            {director.photo && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line">
                <Image src={director.photo} alt={director.name} fill sizes="320px" className="object-cover" />
              </div>
            )}
            <div>
              <SectionHeading eyebrow="Director's message" title={director.name} intro={director.role} />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-ink md:mt-8 md:text-lg">
                {director.message.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio at a glance, over a photo */}
      <section className="container-site pb-10">
        <div className="relative isolate overflow-hidden rounded-3xl text-white md:rounded-[2rem]">
          {band && <Image src={band.src} alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: band.position }} />}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-brand/70" />
          <div className="grid gap-8 p-6 sm:p-8 md:p-14 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-10">
            <div>
              <p className="eyebrow text-sky-100">Our portfolio</p>
              <h2 className="mt-3 text-2xl font-bold !text-white sm:text-3xl md:text-4xl">{ranges.length} segments, one trade contact</h2>
              <p className="mt-4 text-white/80">Source across formats from a single partner, with clear product information for every listing.</p>
              <div className="btn-row mt-7">
                <Link href="/products" className="btn btn-green">
                  Explore products <ArrowRight aria-hidden className="size-4" />
                </Link>
                <RequestCallButton className="btn btn-outline-light" />
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {ranges.map((r) => (
                <li key={r.slug}>
                  <Link href={`/products/${r.slug}`} className="block rounded-full bg-white/10 px-3.5 py-2.5 text-sm font-medium ring-1 ring-white/20 backdrop-blur-sm hover:bg-white hover:text-navy sm:px-4">
                    {r.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
