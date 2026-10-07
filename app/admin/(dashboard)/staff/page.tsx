import type { Metadata } from "next";
import { Badge, Card, PageHeader, formatDateTime } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { CreateStaffForm, ResetPasswordForm, StaffRoleForm } from "@/components/admin/StaffForms";
import { removeStaff } from "@/lib/admin/actions/staff";
import { listStaff } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Staff accounts" };

export default async function StaffPage() {
  const session = await requireAdmin();
  const staff = await listStaff();
  return (
    <>
      <PageHeader title="Staff accounts" description="Only administrators can see this page. There is no public sign-up; accounts are created here." />
      <Card title="Add a staff member" className="mb-6">
        <div className="p-4 sm:p-5">
          <CreateStaffForm />
        </div>
      </Card>
      <Card title={`${staff.length} accounts`}>
        <ul className="divide-y divide-line">
          {staff.map((u) => {
            const self = u.id === session.userId;
            return (
              <li key={u.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {u.name} {self && <span className="font-normal text-muted">(you)</span>}
                    </p>
                    <p className="break-all text-sm text-muted">{u.email}</p>
                  </div>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={u.role === "admin" ? "blue" : u.role === "editor" ? "grey" : "amber"}>{u.role === "admin" ? "Administrator" : u.role === "editor" ? "Editor" : "Staff"}</Badge>
                    {u.banned && <Badge tone="red">Blocked</Badge>}
                    <span className="text-xs text-muted">Added {formatDateTime(u.createdAt)}</span>
                  </span>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                  {self ? <p className="text-sm text-muted">You cannot change your own role.</p> : <StaffRoleForm userId={u.id} role={u.role ?? "editor"} />}
                  <div className="flex flex-wrap items-end gap-2">
                    <ResetPasswordForm userId={u.id} />
                    {!self && (
                      <ActionButton action={removeStaff} fields={{ userId: u.id }} variant="danger" confirm={`Remove ${u.name}'s account? They will be signed out and lose access.`}>
                        Remove
                      </ActionButton>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
