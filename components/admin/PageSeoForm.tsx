"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton, AdminForm, Checkbox, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { Card } from "@/components/admin/ui";
import { resetPageSeo, savePageSeo } from "@/lib/admin/actions/seo";

type Props = {
  path: string;
  siteName: string;
  siteUrl: string;
  defaults: { title: string; description: string };
  values: { title: string; description: string; ogImage: string; noIndex: boolean };
  hasOverride: boolean;
};

// Google truncates around these lengths on desktop results.
const TITLE_MAX = 60;
const DESC_MAX = 155;

function Counter({ length, max }: { length: number; max: number }) {
  const tone = length === 0 ? "text-muted" : length > max ? "text-amber-700" : "text-emerald-700";
  return (
    <span className={tone}>
      {length}/{max} characters{length > max ? " — may be cut off in Google" : ""}
    </span>
  );
}

export function PageSeoForm({ path, siteName, siteUrl, defaults, values, hasOverride }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(values.title);
  const [description, setDescription] = useState(values.description);
  const shownTitle = title.trim() || defaults.title;
  const shownDescription = description.trim() || defaults.description;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <AdminForm action={savePageSeo} onSuccess={() => router.refresh()}>
        {({ errors, pending }) => (
          <Card title="Search engine listing" description="Leave a field empty to keep the automatic text shown as its placeholder.">
            <input type="hidden" name="path" value={path} />
            <div className="grid gap-4 p-4 sm:p-5">
              <TextField
                name="title"
                label="Title tag"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaults.title}
                error={errors.title}
                hint={<Counter length={shownTitle.length} max={TITLE_MAX} />}
              />
              <TextArea
                name="description"
                label="Meta description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={defaults.description}
                error={errors.description}
                hint={<Counter length={shownDescription.length} max={DESC_MAX} />}
              />
              <TextField
                name="ogImage"
                label="Share image (Open Graph)"
                defaultValue={values.ogImage}
                placeholder="Empty = default share image"
                error={errors.ogImage}
                hint="1200 × 630 JPG or PNG; https:// address or a site path such as /photos/share.jpg."
              />
              <Checkbox name="noIndex" label="Hide this page from search engines (noindex)" defaultChecked={values.noIndex} hint="The page stays on the website but is removed from Google and from the sitemap." />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3 sm:px-5">
              <SubmitButton pending={pending}>Save</SubmitButton>
              <a href={path} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-ghost">
                View page
              </a>
            </div>
          </Card>
        )}
      </AdminForm>

      <div className="space-y-4">
        <Card title="Google preview">
          <div className="p-4 sm:p-5">
            <p className="truncate text-xs text-slate-600">
              {siteUrl.replace(/^https?:\/\//, "")}
              {path === "/" ? "" : path.replace(/\//g, " › ").replace(/^ › /, " › ")}
            </p>
            <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{title.trim() || (defaults.title.includes(siteName) ? defaults.title : `${defaults.title} | ${siteName}`)}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700">{shownDescription}</p>
          </div>
        </Card>
        {hasOverride && (
          <Card title="Reset" description="Remove all changes for this page and use the automatic title, description and image.">
            <div className="p-4 sm:p-5">
              <ActionButton action={resetPageSeo} fields={{ path }} variant="danger" confirm={{ title: "Reset to automatic SEO?", message: "The custom title, description, share image and search setting for this page are removed.", confirmLabel: "Reset page" }}>
                Reset to automatic
              </ActionButton>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
