"use client";

import Image from "next/image";
import { useState } from "react";
import { AdminForm, Checkbox, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { saveRange, saveRangeImage } from "@/lib/admin/actions/content";

export const RANGE_ICONS = [
  { value: "pill", label: "Tablets" },
  { value: "bottle", label: "Bottle / flask" },
  { value: "softgel", label: "Capsule" },
  { value: "syringe", label: "Syringe" },
  { value: "leaf", label: "Leaf" },
  { value: "tooth", label: "Toothbrush" },
  { value: "tube", label: "Tube" },
  { value: "jar", label: "Jar" },
  { value: "sparkles", label: "Sparkles" },
  { value: "droplet", label: "Dropper" },
];

type Range = { id?: number; shortName: string; slug: string; icon: string; sortOrder: number };

export function RangeFields({ range, onSaved, submitLabel }: { range: Range; onSaved?: () => void; submitLabel: string }) {
  const [icon, setIcon] = useState(range.icon);
  return (
    <AdminForm
      action={saveRange}
      onSuccess={() => {
        // The add form clears its text fields on success; the controlled icon picker must follow.
        if (!range.id) setIcon(range.icon);
        onSaved?.();
      }}
      resetOnSuccess={!range.id}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_6rem_auto] lg:items-start">
      {({ errors, pending }) => (
        <>
          {range.id && <input type="hidden" name="id" value={range.id} />}
          <TextField name="shortName" label="Name" required defaultValue={range.shortName} error={errors.shortName} />
          <TextField name="slug" label="Slug" defaultValue={range.slug} error={errors.slug} hint={range.id ? undefined : "Blank = from name"} />
          <div className="flex items-end gap-2">
            <SelectField name="icon" label="Icon" className="flex-1" value={icon} onChange={(e) => setIcon(e.target.value)} options={RANGE_ICONS} error={errors.icon} />
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <RangeIcon icon={icon} className="size-5" />
            </span>
          </div>
          <TextField name="sortOrder" label="Order" type="number" min={0} defaultValue={range.sortOrder} error={errors.sortOrder} />
          <SubmitButton pending={pending} className="lg:mt-6">{submitLabel}</SubmitButton>
        </>
      )}
    </AdminForm>
  );
}

/** Master image for a segment: shown on the home cards, the range banner and product pages. */
export function RangeImageForm({ id, image, imageAlt, name }: { id: number; image: string; imageAlt: string; name: string }) {
  return (
    <AdminForm action={saveRangeImage} className="flex flex-wrap items-start gap-3">
      {({ errors, pending }) => (
        <>
          <input type="hidden" name="id" value={id} />
          <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-line">
            {image ? (
              <Image src={image} alt={imageAlt || name} fill sizes="96px" className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-[0.7rem] text-muted">Stock photo</span>
            )}
          </span>
          <span className="min-w-56 flex-1 space-y-2">
            <label htmlFor={`range-image-${id}`} className="block text-sm font-medium text-ink">
              Master image
            </label>
            <input
              id={`range-image-${id}`}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold"
            />
            {errors.image && <span className="block text-xs font-medium text-red-700">{errors.image}</span>}
            <TextField name="imageAlt" label="Image description" defaultValue={imageAlt} error={errors.imageAlt} hint="Describe the photo for screen readers." />
            {image && <Checkbox name="removeImage" label="Remove image (use the stock photo again)" />}
          </span>
          <SubmitButton pending={pending} variant="secondary" className="sm:mt-6">
            Save image
          </SubmitButton>
        </>
      )}
    </AdminForm>
  );
}
