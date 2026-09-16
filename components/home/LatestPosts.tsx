import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { formatDate, type BlogPost } from "@/lib/data/blog";
import { photo } from "@/lib/site/photos";

export function LatestPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="posts-title" className="py-14 md:py-20 lg:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <SectionHeading id="posts-title" eyebrow="From our blog" title="Notes for the pharma trade" />
          <Link href="/blog" className="link-arrow" data-reveal>
            All articles <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <ul className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:thin] md:mx-0 md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {posts.slice(0, 3).map((post, i) => {
            const img = photo(post.cover);
            return (
              <li key={post.slug} className="w-[82%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none" data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                    {img && <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <div className="flex flex-1 flex-col p-5 lg:p-6">
                    <h3 className="text-lg font-bold leading-snug">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs font-medium text-muted">
                      {post.publishedOn && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays aria-hidden className="size-4 text-green" />
                          <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 font-semibold text-brand">
                        Read <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
