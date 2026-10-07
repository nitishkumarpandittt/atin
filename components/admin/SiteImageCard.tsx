"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ActionButton, AdminForm, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { Badge } from "@/components/admin/ui";
import { resetSiteImage, saveSiteImage } from "@/lib/admin/actions/site-images";

type Props = {
  placement: { key: string; label: string; hint?: string };
  current: { src: string; alt: string; position: string };
  custom: boolean;
};

const POSITION_OPTIONS = [
  { value: "center", label: "Centre" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export function SiteImageCard({ placement, current, custom }: Props) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-line">
      <div className="relative aspect-[16/9] bg-slate-100">
        {current.src ? (
          <Image src={current.src} alt={current.alt} fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover" style={{ objectPosition: current.position }} />
        ) : (
          <span className="grid h-full place-items-center text-xs text-muted">No photo</span>
        )}
        <span className="absolute left-2 top-2">
          <Badge tone={custom ? "green" : "grey"}>{custom ? "Uploaded" : "Default photo"}</Badge>
        </span>
      </div>
      {/* key: remount after save so the file input and fields show the stored values. */}
      <AdminForm key={`${current.src}|${current.alt}|${current.position}`} action={saveSiteImage} onSuccess={() => router.refresh()} className="p-4">
        {({ errors, pending }) => (
          <div className="grid gap-3">
            <div>
              <p className="font-semibold text-ink">{placement.label}</p>
              {placement.hint && <p className="mt-0.5 text-xs text-muted">{placement.hint}</p>}
            </div>
            <input type="hidden" name="key" value={placement.key} />
            <div>
              <label htmlFor={`file-${placement.key}`} className="mb-1 block text-sm font-medium text-ink">
                {custom ? "Replace photo" : "Upload a photo"}
              </label>
              <input
                id={`file-${placement.key}`}
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold"
              />
              {errors.file ? <p className="mt-1 text-xs font-medium text-red-700">{errors.file}</p> : <p className="mt-1 text-xs text-muted">Landscape JPG, PNG or WebP, at least 1600 px wide.</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <TextField name="alt" label="Description (alt text)" defaultValue={custom ? current.alt : ""} placeholder={current.alt} />
              <SelectField name="position" label="Keep in view" defaultValue={current.position} options={POSITION_OPTIONS} />
            </div>
            <SubmitButton pending={pending} className="justify-self-start">
              Save
            </SubmitButton>
          </div>
        )}
      </AdminForm>
      {/* Outside the save form: ActionButton is its own <form>, and forms cannot be nested. */}
      {custom && (
        <div className="border-t border-line px-4 py-3">
          <ActionButton action={resetSiteImage} fields={{ key: placement.key }} variant="ghost" confirm={{ title: "Use the default photo?", message: "The uploaded photo is deleted and the original photo is shown again.", confirmLabel: "Use default photo", tone: "danger" }}>
            Use default photo
          </ActionButton>
        </div>
      )}
    </div>
  );
}
