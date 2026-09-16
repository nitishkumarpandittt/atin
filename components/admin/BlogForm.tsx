"use client";

import Image from "next/image";
import { AdminForm, Checkbox, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { Card } from "@/components/admin/ui";
import { saveBlogPost } from "@/lib/admin/actions/content";

type Post = { id?: number; title: string; slug: string; excerpt: string; content: string; author: string; publishedOn: string; isPublished: boolean };

export function BlogForm({ value, coverUrl }: { value: Post; coverUrl: string }) {
  return (
    <AdminForm action={saveBlogPost} className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      {({ errors, pending }) => (
        <>
          {value.id && <input type="hidden" name="id" value={value.id} />}
          <Card className="p-4 sm:p-5">
            <div className="grid gap-4">
              <TextField name="title" label="Title" required defaultValue={value.title} error={errors.title} />
              <TextArea name="excerpt" label="Summary" rows={2} defaultValue={value.excerpt} error={errors.excerpt} hint="Shown on blog cards and in search results." />
              <TextArea
                name="content"
                label="Article (Markdown)"
                required
                rows={22}
                defaultValue={value.content}
                error={errors.content}
                className="[&_textarea]:font-mono [&_textarea]:text-sm"
                hint="Use ## for headings, **bold**, - for lists and [text](https://link) for links. HTML is not allowed."
              />
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="Publishing">
              <div className="grid gap-3 p-4">
                <Checkbox name="isPublished" label="Published" hint="Drafts are not shown on the website." defaultChecked={value.isPublished} />
                <TextField name="publishedOn" label="Publish date" type="date" defaultValue={value.publishedOn} error={errors.publishedOn} hint="Blank = today when published. Future dates stay hidden until then." />
                <TextField name="author" label="Author" defaultValue={value.author} error={errors.author} />
                <TextField name="slug" label="URL slug" defaultValue={value.slug} error={errors.slug} hint="Blank = from the title." />
                <SubmitButton pending={pending} className="w-full">
                  {value.id ? "Save post" : "Create post"}
                </SubmitButton>
              </div>
            </Card>
            <Card title="Cover image">
              <div className="p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 ring-1 ring-line">
                  {coverUrl ? <Image src={coverUrl} alt="Cover" fill sizes="288px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs text-muted">No cover</span>}
                </div>
                <label htmlFor="f-cover" className="sr-only">
                  Upload cover
                </label>
                <input id="f-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-2 block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold" />
                {errors.cover && <p className="mt-1 text-xs font-medium text-red-700">{errors.cover}</p>}
                {coverUrl && <Checkbox name="removeCover" label="Remove cover" />}
              </div>
            </Card>
          </div>
        </>
      )}
    </AdminForm>
  );
}
