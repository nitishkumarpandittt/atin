import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { Marked, type Tokens } from "marked";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedOn: string;
  cover: string;
  content: string;
  readingMinutes: number;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {} as Record<string, string>, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: match[2] };
}

export const getPosts = cache(async (): Promise<BlogPost[]> => {
  let files: string[] = [];
  try {
    files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (file) => {
      const { meta, body } = parseFrontmatter(await readFile(path.join(BLOG_DIR, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: meta.title ?? file,
        excerpt: meta.excerpt ?? "",
        author: meta.author ?? "Atin HealthCare",
        publishedOn: meta.publishedOn ?? "",
        cover: meta.cover ?? "",
        content: body,
        readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
      };
    }),
  );
  return posts.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
});

export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

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
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${
        external ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${label}</a>`;
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
