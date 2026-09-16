import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { Marked, type Tokens } from "marked";
import { cache } from "react";
import { db, schema } from "@/lib/db";
import { photo } from "@/lib/site/photos";
import { uploadUrl } from "@/lib/uploads/url";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedOn: string;
  cover: string;
  coverAlt: string;
  content: string;
  readingMinutes: number;
};

/** Covers are either an uploaded file ("blog/<uuid>.webp") or a stock photo slot name ("blog-1"). */
export function resolveCover(coverPath: string, title: string): { src: string; alt: string } {
  const stock = photo(coverPath);
  if (stock) return { src: stock.src, alt: stock.alt };
  return { src: uploadUrl(coverPath), alt: coverPath ? title : "" };
}

export const getPosts = cache(async (): Promise<BlogPost[]> => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.isPublished, true))
    .orderBy(desc(schema.blogPosts.publishedOn), desc(schema.blogPosts.id));
  return rows
    .filter((r) => !r.publishedOn || r.publishedOn <= today)
    .map((r) => {
      const cover = resolveCover(r.coverPath, r.title);
      return {
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        author: r.author,
        publishedOn: r.publishedOn,
        cover: cover.src,
        coverAlt: cover.alt,
        content: r.content,
        readingMinutes: Math.max(1, Math.round(r.content.split(/\s+/).length / 220)),
      };
    });
});

export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

/** Drafts are visible to staff previews only. */
export async function getPostForPreview(slug: string) {
  const [row] = await db.select().from(schema.blogPosts).where(and(eq(schema.blogPosts.slug, slug))).limit(1);
  return row ?? null;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const safeHref = (href: string) => /^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(href.trim());

// Raw HTML in Markdown is escaped; links are limited to http(s), mailto, tel and site-relative URLs.
const markdown = new Marked({
  gfm: true,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens);
      if (!safeHref(href)) return label;
      const external = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    },
    image({ text }: Tokens.Image) {
      return escapeHtml(text);
    },
  },
});

export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false }) as string;
}

export const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
