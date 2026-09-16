"use client";

import { useState } from "react";
import { AdminForm, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { RangeIcon } from "@/components/primitives/RangeIcon";
import { saveRange } from "@/lib/admin/actions/content";

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
    <AdminForm action={saveRange} onSuccess={onSaved} resetOnSuccess={!range.id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr_6rem_auto] lg:items-end">
      {({ errors, pending }) => (
        <>
          {range.id && <input type="hidden" name="id" value={range.id} />}
          <TextField name="shortName" label="Name" required defaultValue={range.shortName} error={errors.shortName} />
          <TextField name="slug" label="Slug" defaultValue={range.slug} error={errors.slug} hint={range.id ? undefined : "Blank = from name"} />
          <div className="flex items-end gap-2">
            <SelectField name="icon" label="Icon" className="flex-1" value={icon} onChange={(e) => setIcon(e.target.value)} options={RANGE_ICONS} error={errors.icon} />
            <span className="mb-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <RangeIcon icon={icon} className="size-5" />
            </span>
          </div>
          <TextField name="sortOrder" label="Order" type="number" min={0} defaultValue={range.sortOrder} error={errors.sortOrder} />
          <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        </>
      )}
    </AdminForm>
  );
}
