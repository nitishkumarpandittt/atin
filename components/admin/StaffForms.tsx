"use client";

import { useState } from "react";
import { AdminForm, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { createStaff, resetStaffPassword, setStaffRole } from "@/lib/admin/actions/staff";

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor: catalogue, content and enquiries" },
  { value: "admin", label: "Administrator: everything, including staff" },
];

export function CreateStaffForm() {
  return (
    <AdminForm action={createStaff} resetOnSuccess className="grid gap-3 sm:grid-cols-2">
      {({ errors, pending }) => (
        <>
          <TextField name="name" label="Name" required autoComplete="off" error={errors.name} />
          <TextField name="email" label="Email" type="email" required autoComplete="off" error={errors.email} />
          <SelectField name="role" label="Role" defaultValue="editor" options={ROLE_OPTIONS} error={errors.role} />
          <TextField name="password" label="Temporary password" type="password" required autoComplete="new-password" minLength={12} error={errors.password} hint="At least 12 characters. Ask them to change it after signing in." />
          <div className="sm:col-span-2">
            <SubmitButton pending={pending}>Create account</SubmitButton>
          </div>
        </>
      )}
    </AdminForm>
  );
}

export function StaffRoleForm({ userId, role }: { userId: string; role: string }) {
  return (
    <AdminForm action={setStaffRole} className="flex flex-wrap items-end gap-2">
      {({ errors, pending }) => (
        <>
          <input type="hidden" name="userId" value={userId} />
          <SelectField name="role" label="Role" defaultValue={role === "admin" ? "admin" : "editor"} options={ROLE_OPTIONS} error={errors.role} className="min-w-64 flex-1" />
          <SubmitButton pending={pending} variant="secondary">
            Update role
          </SubmitButton>
        </>
      )}
    </AdminForm>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setOpen(true)}>
        Reset password
      </button>
    );
  return (
    <AdminForm action={resetStaffPassword} resetOnSuccess className="flex flex-wrap items-end gap-2">
      {({ errors, pending }) => (
        <>
          <input type="hidden" name="userId" value={userId} />
          <TextField name="newPassword" label="New password" type="password" autoComplete="new-password" minLength={12} error={errors.newPassword} className="min-w-56 flex-1" />
          <SubmitButton pending={pending}>Set password</SubmitButton>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </>
      )}
    </AdminForm>
  );
}
