import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { disclaimer } from "@/lib/site/content";
import { site } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Terms under which product information is published on the Atin HealthCare website.",
};

export default function DisclaimerPage() {
  return (
    <>
      <PageHero title="Disclaimer" eyebrow="Legal" intro={`How information is provided on the ${site.name} website.`} crumbs={[{ label: "Disclaimer" }]} />
      <section className="container-site py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <ol className="space-y-8 md:space-y-10">
            {disclaimer.map((d, i) => (
              <li key={d.heading} className="grid grid-cols-[2.25rem_1fr] gap-3 sm:grid-cols-[3rem_1fr] sm:gap-4">
                <span className="grid size-9 place-items-center rounded-lg bg-sky-100 font-display text-sm font-bold text-brand sm:size-11 sm:rounded-xl sm:text-base">{i + 1}</span>
                <div>
                  <h2 className="pt-1 text-lg font-bold sm:pt-2 sm:text-xl">{d.heading}</h2>
                  <p className="mt-2 leading-relaxed text-ink">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-t md:mt-14 border-line pt-6 text-sm text-muted">Last updated: September 2026</p>
        </div>
      </section>
    </>
  );
}
