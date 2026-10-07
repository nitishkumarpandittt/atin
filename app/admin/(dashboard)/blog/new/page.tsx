import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/BlogForm";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const session = await requireRole("editor");
  return (
    <>
      <PageHeader title="New post" back={{ href: "/admin/blog", label: "Blog" }} />
      <BlogForm coverUrl="" value={{ title: "", slug: "", excerpt: "", content: "", author: session.name || "Atin HealthCare", publishedOn: "", isPublished: false }} />
    </>
  );
}
