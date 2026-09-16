import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { formatDate, getPost, getPosts, renderMarkdown } from "@/lib/data/blog";
import { site } from "@/lib/site/config";
import { photo } from "@/lib/site/photos";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: post.cover ? [post.cover] : undefined },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const cover = post.cover ? { src: post.cover, alt: post.coverAlt } : null;
  const html = renderMarkdown(post.content);
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedOn,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.legalName },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero
        eyebrow="Blog"
        title={post.title}
        photo={cover ?? photo("blog-2")}
        overlap
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      >
        <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80 md:mt-6">
          <span>{post.author}</span>
          {post.publishedOn && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-4" />
              <time dateTime={post.publishedOn}>{formatDate(post.publishedOn)}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" /> {post.readingMinutes} min read
          </span>
        </p>
      </PageHero>

      <article className="container-site relative z-10 -mt-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white px-4 py-5 shadow-lift ring-1 ring-line sm:p-10 md:rounded-[2rem] md:p-14">
          {cover && (
            <div className="relative mb-7 aspect-[16/9] overflow-hidden rounded-2xl sm:-mx-4 sm:mb-10">
              <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
            </div>
          )}
          <p className="px-1 text-lg leading-relaxed text-navy sm:px-0 md:text-xl">{post.excerpt}</p>
          <div className="prose-atin mt-6 px-1 sm:mt-8 sm:px-0" dangerouslySetInnerHTML={{ __html: html }} />
          <p className="mt-12 border-t border-line pt-6 text-xs leading-relaxed text-muted">
            This article is general information for the pharma trade. It is not medical advice.
          </p>
        </div>
      </article>

      <section className="container-site py-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">More articles</h2>
            <Link href="/blog" className="link-arrow">
              <ArrowLeft aria-hidden className="size-4" /> All articles
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-6">
            {more.map((p) => {
              return (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group flex gap-5 rounded-3xl bg-white p-4 shadow-card ring-1 ring-line transition hover:shadow-lift">
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface sm:size-28">
                      {p.cover && <Image src={p.cover} alt="" fill sizes="112px" className="object-cover" />}
                    </span>
                    <span className="flex flex-col justify-center">
                      <span className="font-bold leading-snug text-navy group-hover:text-brand">{p.title}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                        Read <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
