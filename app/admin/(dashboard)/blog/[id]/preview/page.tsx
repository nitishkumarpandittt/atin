import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getBlogPost } from "@/lib/admin/queries";
import { formatDate, renderMarkdown, resolveCover } from "@/lib/data/blog";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Preview post" };

export default async function PreviewPostPage({ params }: PageProps<"/admin/blog/[id]/preview">) {
  await requireRole("editor");
  const post = await getBlogPost(Number((await params).id));
  if (!post) notFound();
  const cover = resolveCover(post.coverPath, post.title);
  return (
    <>
      <PageHeader
        title="Preview"
        back={{ href: `/admin/blog/${post.id}`, label: "Back to editor" }}
        description={<span className="flex items-center gap-2">{post.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>} This is how the article body renders on the website.</span>}
      />
      <Card className="mx-auto max-w-3xl p-5 sm:p-10">
        {cover.src && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image src={cover.src} alt={cover.alt} fill sizes="720px" className="object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-ink">{post.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {post.author}
          {post.publishedOn && ` · ${formatDate(post.publishedOn)}`}
        </p>
        {post.excerpt && <p className="mt-6 text-lg text-ink">{post.excerpt}</p>}
        <div className="prose-atin mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      </Card>
    </>
  );
}
