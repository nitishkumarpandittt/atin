import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { formatDate, getPosts } from "@/lib/data/blog";
import { photo } from "@/lib/site/photos";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes for the pharma trade from Atin HealthCare: catalogue guides, stock handling and product formats.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes for the pharma trade"
        intro="Practical guides on reading our catalogue, handling stock and understanding product formats."
        photo={photo("blog-1")}
        crumbs={[{ label: "Blog" }]}
      />

      <section className="container-site py-10 md:py-16 lg:py-24">
        {!featured ? (
          <p className="rounded-3xl bg-surface p-10 text-center text-muted">New articles will be published here soon.</p>
        ) : (
          <>
            <article className="group relative grid overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition hover:shadow-lift md:rounded-[2rem] lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[24rem]">
                <Cover slot={featured.cover} sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12">
                <p className="eyebrow text-green">Latest article</p>
                <h2 className="mt-3 text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                  <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 text-muted">{featured.excerpt}</p>
                <Meta date={featured.publishedOn} minutes={featured.readingMinutes} />
                <span className="link-arrow mt-6">
                  Read article <ArrowRight aria-hidden className="size-4" />
                </span>
              </div>
            </article>

            {rest.length > 0 && (
              <ul className="mt-6 grid gap-4 sm:gap-6 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <li key={post.slug} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Cover slot={post.cover} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                      </div>
                      <div className="flex flex-1 flex-col p-5 lg:p-6">
                        <h3 className="text-lg font-bold leading-snug">
                          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
                        <div className="mt-auto">
                          <Meta date={post.publishedOn} minutes={post.readingMinutes} />
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </>
  );
}

function Cover({ slot, sizes }: { slot: string; sizes: string }) {
  const img = photo(slot);
  if (!img) return <div className="h-full w-full bg-gradient-to-br from-brand to-navy" />;
  return <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />;
}

function Meta({ date, minutes }: { date: string; minutes: number }) {
  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-medium text-muted">
      {date && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden className="size-4 text-green" />
          <time dateTime={date}>{formatDate(date)}</time>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <Clock aria-hidden className="size-4 text-green" /> {minutes} min read
      </span>
    </p>
  );
}
