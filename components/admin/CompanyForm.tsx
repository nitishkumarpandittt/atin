"use client";

import Image from "next/image";
import { AdminForm, Checkbox, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { Card } from "@/components/admin/ui";
import { saveCompany } from "@/lib/admin/actions/content";
import type { Company } from "@/lib/data/site";

export function CompanyForm({ values, photoUrl }: { values: Company; photoUrl: string }) {
  return (
    <AdminForm action={saveCompany} className="space-y-6">
      {({ errors, pending }) => (
        <>
          <Card title="Contact details" description="Shown in the header, footer and on the contact page. Empty fields are hidden.">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <TextField name="phone" label="Phone" type="tel" defaultValue={values.phone} error={errors.phone} />
              <TextField name="whatsappNumber" label="WhatsApp number" type="tel" defaultValue={values.whatsappNumber} error={errors.whatsappNumber} hint="With country code, e.g. +91 98765 43210. Shows the WhatsApp button." />
              <TextField name="email" label="Email" type="email" defaultValue={values.email} error={errors.email} />
              <TextField name="businessHours" label="Business hours" defaultValue={values.businessHours} error={errors.businessHours} />
              <TextArea name="registeredAddress" label="Registered address" rows={2} defaultValue={values.registeredAddress} error={errors.registeredAddress} className="sm:col-span-2" />
            </div>
          </Card>

          <Card title="Company profile" description="About page. Separate paragraphs with a blank line.">
            <div className="grid gap-4 p-4 sm:p-5">
              <TextArea name="profile" label="Profile" rows={7} defaultValue={values.profile} error={errors.profile} />
              <TextArea name="vision" label="Vision" rows={3} defaultValue={values.vision} error={errors.vision} />
              <TextArea name="mission" label="Mission" rows={5} defaultValue={values.mission} error={errors.mission} hint="One point per line." />
            </div>
          </Card>

          <Card title="Director's message" description="Hidden on the website until a name and message are filled in.">
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_12rem] sm:p-5">
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField name="directorName" label="Name" defaultValue={values.directorName} error={errors.directorName} />
                  <TextField name="directorRole" label="Role" defaultValue={values.directorRole} error={errors.directorRole} hint="e.g. Managing Director" />
                </div>
                <TextArea name="directorMessage" label="Message" rows={7} defaultValue={values.directorMessage} error={errors.directorMessage} />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-ink">Photo</p>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100 ring-1 ring-line">
                  {photoUrl ? <Image src={photoUrl} alt="Director" fill sizes="192px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs text-muted">No photo</span>}
                </div>
                <label htmlFor="f-directorPhoto" className="sr-only">
                  Upload photo
                </label>
                <input id="f-directorPhoto" name="directorPhoto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-2 block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold" />
                {errors.directorPhoto && <p className="mt-1 text-xs font-medium text-red-700">{errors.directorPhoto}</p>}
                {photoUrl && <Checkbox name="removeDirectorPhoto" label="Remove photo" />}
              </div>
            </div>
          </Card>

          <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:ring-1 sm:ring-line">
            <SubmitButton pending={pending}>Save company details</SubmitButton>
            <span className="text-xs text-muted">Saving updates the public website immediately.</span>
          </div>
        </>
      )}
    </AdminForm>
  );
}
