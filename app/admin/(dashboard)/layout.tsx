import { AdminShell } from "@/components/admin/AdminShell";
import { getSidebarCounts } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";

// No <Suspense> around the shell: admin pages are dynamic, and a Suspense boundary here blocked hydration.
export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireStaff();
  const counts = await getSidebarCounts();
  return (
    <AdminShell user={{ name: session.name, email: session.email, role: session.role }} counts={counts}>
      {children}
    </AdminShell>
  );
}
