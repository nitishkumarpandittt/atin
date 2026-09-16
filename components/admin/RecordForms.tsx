"use client";

import { useState } from "react";
import { AdminForm, Checkbox, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { saveCredential, saveTestimonial } from "@/lib/admin/actions/content";

type Credential = { id?: number; name: string; issuingAuthority: string; number: string; validUntil: string; isPublished: boolean; sortOrder: number };

export function CredentialForm({ value, submitLabel }: { value: Credential; submitLabel: string }) {
  return (
    <AdminForm action={saveCredential} resetOnSuccess={!value.id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {({ errors, pending }) => (
        <>
          {value.id && <input type="hidden" name="id" value={value.id} />}
          <TextField name="name" label="Licence / registration" required defaultValue={value.name} error={errors.name} className="sm:col-span-2" hint="e.g. Wholesale Drug Licence (Form 20B)" />
          <TextField name="issuingAuthority" label="Issuing authority" defaultValue={value.issuingAuthority} error={errors.issuingAuthority} className="sm:col-span-2" />
          <TextField name="number" label="Number" defaultValue={value.number} error={errors.number} />
          <TextField name="validUntil" label="Valid until" type="date" defaultValue={value.validUntil} error={errors.validUntil} />
          <TextField name="sortOrder" label="Order" type="number" min={0} defaultValue={value.sortOrder} error={errors.sortOrder} />
          <div className="flex items-end">
            <Checkbox name="isPublished" label="Show on website" defaultChecked={value.isPublished} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          </div>
        </>
      )}
    </AdminForm>
  );
}

type Testimonial = { id?: number; quote: string; name: string; role: string; organisation: string; hasPermission: boolean; isPublished: boolean; sortOrder: number };

export function TestimonialForm({ value, submitLabel }: { value: Testimonial; submitLabel: string }) {
  const [permission, setPermission] = useState(value.hasPermission);
  return (
    <AdminForm action={saveTestimonial} resetOnSuccess={!value.id} className="grid gap-3 sm:grid-cols-3">
      {({ errors, pending }) => (
        <>
          {value.id && <input type="hidden" name="id" value={value.id} />}
          <TextArea name="quote" label="Testimonial" required rows={3} defaultValue={value.quote} error={errors.quote} className="sm:col-span-3" hint="Trade partners only. No patient testimonials and no claims about treatment results." />
          <TextField name="name" label="Name" required defaultValue={value.name} error={errors.name} />
          <TextField name="role" label="Role" defaultValue={value.role} error={errors.role} hint="e.g. Proprietor" />
          <TextField name="organisation" label="Organisation" defaultValue={value.organisation} error={errors.organisation} />
          <div className="space-y-1 sm:col-span-2">
            <Checkbox name="hasPermission" label="Written permission received" hint="Required before it can be published." defaultChecked={value.hasPermission} onChange={(e) => setPermission(e.target.checked)} error={errors.hasPermission} />
            <Checkbox name="isPublished" label="Show on website" defaultChecked={value.isPublished} disabled={!permission} />
          </div>
          <TextField name="sortOrder" label="Order" type="number" min={0} defaultValue={value.sortOrder} error={errors.sortOrder} />
          <div className="sm:col-span-3">
            <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
          </div>
        </>
      )}
    </AdminForm>
  );
}
