import type { Metadata } from "next";
import { CircleCheck, Eye, Target } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { getPublicCompany } from "@/lib/data/site";
import { sitePhoto } from "@/lib/data/site-images";
import { seoMeta, staticPages } from "@/lib/data/seo";

export async function generateMetadata(): Promise<Metadata> {
  return seoMeta(staticPages["/vision"]);
}

export default async function VisionPage() {
  const [company, photo] = await Promise.all([getPublicCompany(), sitePhoto("about-hero")]);
  const { vision, mission } = company;

  return (
    <>
      <PageHero
        eyebrow="Vision & mission"
        title="What guides our work"
        intro="The principles behind how we serve the pharma trade."
        photo={photo}
        crumbs={[{ label: "About us", href: "/about" }, { label: "Vision & mission" }]}
      />
      <section className="container-site py-14 md:py-20 lg:py-28">
        <SectionHeading align="center" eyebrow="Our direction" title="What guides our work" />
        {(vision || mission.length > 0) ? (
          <div className={`mx-auto mt-10 grid max-w-5xl gap-4 sm:gap-6 md:mt-14 ${vision && mission.length ? "lg:grid-cols-2" : ""}`}>
            {vision && (
              <article className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-lift sm:p-8 md:rounded-[2rem] md:p-10" data-reveal>
                <div aria-hidden className="hex-pattern absolute inset-0" />
                <span className="relative grid size-14 place-items-center rounded-2xl bg-white/10"><Eye aria-hidden className="size-7" /></span>
                <h2 className="relative mt-6 text-2xl font-bold !text-white">Our vision</h2>
                <p className="relative mt-4 text-lg leading-relaxed text-white/85">{vision}</p>
              </article>
            )}
            {mission.length > 0 && (
              <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8 md:rounded-[2rem] md:p-10" data-reveal>
                <span className="grid size-14 place-items-center rounded-2xl bg-leaf-100 text-green"><Target aria-hidden className="size-7" /></span>
                <h2 className="mt-6 text-2xl font-bold">Our mission</h2>
                <ul className="mt-5 space-y-3">
                  {mission.map((item) => <li key={item} className="flex gap-3 text-ink"><CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-green" />{item}</li>)}
                </ul>
              </article>
            )}
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-2xl text-center text-muted">Vision and mission details will be available soon.</p>
        )}
      </section>
    </>
  );
}
