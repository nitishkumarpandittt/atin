import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { BlogForm } from "@/components/admin/BlogForm";
import { deleteBlogPost } from "@/lib/admin/actions/content";
import { getBlogPost } from "@/lib/admin/queries";
import { resolveCover } from "@/lib/data/blog";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireRole("editor");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const post = await getBlogPost(Number(id));
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title={post.title}
        back={{ href: "/admin/blog", label: "Blog" }}
        actions={
          <>
            <Link href={`/admin/blog/${post.id}/preview`} className="admin-btn admin-btn-secondary">
              <Eye aria-hidden className="size-4" /> Preview
            </Link>
            <ActionButton action={deleteBlogPost} fields={{ id: post.id, redirect: "list" }} variant="danger" confirm={`Delete "${post.title}"?`}>
              Delete
            </ActionButton>
          </>
        }
      />
      {sp.created && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">Post created.</p>}
      <BlogForm key={post.updatedAt.toISOString()} value={post} coverUrl={post.coverPath ? resolveCover(post.coverPath, post.title).src : ""} />
    </>
  );
}
