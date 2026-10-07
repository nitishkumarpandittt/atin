"use client";

import { ExternalLink } from "lucide-react";
import { AdminForm, SubmitButton, TextField } from "@/components/admin/form";
import { Card } from "@/components/admin/ui";
import { saveSeoSettings } from "@/lib/admin/actions/seo";
import type { SeoSettings } from "@/lib/data/seo";

const links = [
  { href: "https://search.google.com/search-console", label: "Search Console" },
  { href: "https://analytics.google.com/", label: "Google Analytics" },
  { href: "https://www.bing.com/webmasters", label: "Bing Webmaster Tools" },
  { href: "https://business.facebook.com/events_manager2", label: "Meta Events Manager" },
];

export function SeoSettingsForm({ values, canEdit, siteUrl }: { values: SeoSettings; canEdit: boolean; siteUrl: string }) {
  return (
    <AdminForm action={saveSeoSettings}>
      {({ errors, pending }) => (
        <Card
          title="Search Console & analytics tracking"
          description="Verification tags and tracking IDs are added to every public page (never to the admin panel)."
          actions={
            <div className="flex flex-wrap gap-1.5">
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-ghost text-xs">
                  {l.label} <ExternalLink aria-hidden className="size-3.5" />
                </a>
              ))}
            </div>
          }
        >
          <fieldset disabled={!canEdit} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <TextField
              name="googleVerification"
              label="Google Search Console verification"
              defaultValue={values.googleVerification}
              error={errors.googleVerification}
              placeholder="Token or full <meta> tag"
              hint="Search Console → Add property → HTML tag. Paste the token or the whole tag."
            />
            <TextField name="ga4Id" label="Google Analytics 4 measurement ID" defaultValue={values.ga4Id} error={errors.ga4Id} placeholder="G-XXXXXXXXXX" hint="Analytics → Admin → Data streams → your web stream." />
            <TextField name="bingVerification" label="Bing Webmaster verification" defaultValue={values.bingVerification} error={errors.bingVerification} placeholder="Optional" hint="Bing Webmaster Tools → Add site → HTML meta tag." />
            <TextField name="metaPixelId" label="Meta (Facebook) Pixel ID" defaultValue={values.metaPixelId} error={errors.metaPixelId} placeholder="Optional, e.g. 123456789012345" hint="Events Manager → Data sources → Pixel." />
            <TextField
              name="ogImage"
              label="Default share image (Open Graph)"
              defaultValue={values.ogImage}
              error={errors.ogImage}
              placeholder="Leave empty to use the built-in branded image"
              hint="Shown when a page is shared on WhatsApp, LinkedIn or X. 1200 × 630 JPG or PNG; https:// address or a site path."
              className="sm:col-span-2"
            />
            <p className="text-xs text-muted sm:col-span-2">
              After verifying, submit <code className="rounded bg-slate-100 px-1 py-0.5">{siteUrl}/sitemap.xml</code> in Search Console → Sitemaps.
            </p>
          </fieldset>
          {canEdit ? (
            <div className="flex items-center gap-3 border-t border-line px-4 py-3 sm:px-5">
              <SubmitButton pending={pending}>Save tracking settings</SubmitButton>
            </div>
          ) : (
            <p className="border-t border-line px-4 py-3 text-xs text-muted sm:px-5">Only administrators can change tracking settings.</p>
          )}
        </Card>
      )}
    </AdminForm>
  );
}
