"use client";

import { AdminForm, Checkbox, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { saveProduct } from "@/lib/admin/actions/products";

export type ProductFormValues = {
  id?: number;
  brand: string;
  slug: string;
  dosageForm: string;
  composition: string;
  pack: string;
  rangeId: number | null;
  mrp: number | null;
  mrpNote: string | null;
  gstRate: number | null;
  prescribingSpecialities: string | null;
  reviewNote: string | null;
  sortOrder: number;
  isNew: boolean;
  isPublished: boolean;
};

export function ProductForm({ values, ranges }: { values: ProductFormValues; ranges: { id: number; shortName: string }[] }) {
  return (
    <AdminForm action={saveProduct} className="space-y-6">
      {({ errors, pending }) => (
        <>
          {values.id && <input type="hidden" name="id" value={values.id} />}

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Listing</legend>
            <TextField name="brand" label="Brand" required defaultValue={values.brand} error={errors.brand} />
            <TextField name="dosageForm" label="Dosage form" defaultValue={values.dosageForm} error={errors.dosageForm} hint="e.g. Tablet, Syrup, Eye Drops" />
            <SelectField
              name="rangeId"
              label="Range"
              defaultValue={values.rangeId ? String(values.rangeId) : ""}
              error={errors.rangeId}
              options={[{ value: "", label: "No range (not shown publicly)" }, ...ranges.map((r) => ({ value: String(r.id), label: r.shortName }))]}
            />
            <TextField name="pack" label="Pack" defaultValue={values.pack} error={errors.pack} hint="e.g. 10 x 10 (Alu-Alu)" />
            <TextArea name="composition" label="Composition" required rows={3} defaultValue={values.composition} error={errors.composition} className="sm:col-span-2" />
            <TextField
              name="slug"
              label="URL slug"
              defaultValue={values.slug}
              error={errors.slug}
              hint="Leave blank to generate from the brand and dosage form. Changing it changes the product's web address."
              className="sm:col-span-2"
            />
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
            <legend className="mb-3 pt-6 text-sm font-semibold uppercase tracking-wide text-muted">Pricing and prescribing</legend>
            <TextField name="mrp" label="MRP (₹)" inputMode="decimal" defaultValue={values.mrp ?? ""} error={errors.mrp} />
            <TextField name="mrpNote" label="Price note" defaultValue={values.mrpNote ?? ""} error={errors.mrpNote} hint='e.g. "DPCO" when no fixed MRP' />
            <TextField name="gstRate" label="GST (%)" inputMode="decimal" defaultValue={values.gstRate ?? ""} error={errors.gstRate} />
            <TextField
              name="prescribingSpecialities"
              label="Prescribing specialities"
              defaultValue={values.prescribingSpecialities ?? ""}
              error={errors.prescribingSpecialities}
              className="sm:col-span-3"
              hint="Price and specialities stay hidden on the website unless SHOW_MRP_PUBLIC / SHOW_PRESCRIBING_SPECIALITIES are switched on."
            />
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <legend className="mb-3 pt-6 text-sm font-semibold uppercase tracking-wide text-muted">Visibility</legend>
            <div className="space-y-1">
              <Checkbox name="isPublished" label="Published" hint="Visible on the website." defaultChecked={values.isPublished} />
              <Checkbox name="isNew" label="New addition" hint="Listed on the New additions page and home page." defaultChecked={values.isNew} />
            </div>
            <div className="grid gap-4">
              <TextField name="sortOrder" label="Sort order" type="number" min={0} defaultValue={values.sortOrder} error={errors.sortOrder} hint="Lower numbers appear first within the range." />
              <TextField name="reviewNote" label="Review note (internal)" defaultValue={values.reviewNote ?? ""} error={errors.reviewNote} hint="Clear it once the listing wording has been approved." />
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <SubmitButton pending={pending}>{values.id ? "Save changes" : "Create product"}</SubmitButton>
            <p className="text-xs text-muted">Listings must state facts only: no treatment or efficacy claims.</p>
          </div>
        </>
      )}
    </AdminForm>
  );
}
