import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { deleteBlogPost } from "@/lib/admin/actions/content";
import { listBlogPosts } from "@/lib/admin/queries";
import { formatDate, resolveCover } from "@/lib/data/blog";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage({ searchParams }: PageProps<"/admin/blog">) {
  await requireRole("editor");
  const [posts, sp] = await Promise.all([listBlogPosts(), searchParams]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader
        title="Blog"
        description="Articles for the pharma trade. Facts and practical guidance only, no treatment claims."
        actions={
          <Link href="/admin/blog/new" className="admin-btn admin-btn-primary">
            <Plus aria-hidden className="size-4" /> New post
          </Link>
        }
      />
      {sp.deleted && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">Post deleted.</p>}
      <Card>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" action={<Link href="/admin/blog/new" className="admin-btn admin-btn-primary">Write the first post</Link>} />
        ) : (
          <ul className="divide-y divide-line">
            {posts.map((p) => {
              const cover = resolveCover(p.coverPath, p.title);
              const scheduled = p.isPublished && p.publishedOn > today;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
                  <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-line sm:block">
                    {cover.src && <Image src={cover.src} alt="" fill sizes="80px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/admin/blog/${p.id}`} className="font-semibold text-ink hover:text-blue-700 hover:underline">
                      {p.title}
                    </Link>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      {scheduled ? <Badge tone="blue">Scheduled</Badge> : p.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                      {p.publishedOn && formatDate(p.publishedOn)}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <Link href={`/admin/blog/${p.id}`} className="admin-btn admin-btn-secondary">Edit</Link>
                    <Link href={`/admin/blog/${p.id}/preview`} className="admin-btn admin-btn-ghost">Preview</Link>
                    <ActionButton action={deleteBlogPost} fields={{ id: p.id }} variant="danger" confirm={`Delete "${p.title}"?`}>
                      Delete
                    </ActionButton>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
