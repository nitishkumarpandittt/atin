import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** staff: catalogue and enquiries · editor: + website content and SEO · admin: everything, incl. staff accounts. */
export type StaffRole = "admin" | "editor" | "staff";

export type StaffSession = {
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
};

const RANK: Record<StaffRole, number> = { staff: 1, editor: 2, admin: 3 };

/** True when the role is at least `min` (staff < editor < admin). */
export const hasRole = (role: StaffRole, min: StaffRole) => RANK[role] >= RANK[min];

export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result || result.user.banned) return null;
  // Unknown or missing roles get the least access.
  const role: StaffRole = result.user.role === "admin" ? "admin" : result.user.role === "editor" ? "editor" : "staff";
  return { userId: result.user.id, name: result.user.name, email: result.user.email, role };
});

/** For admin pages: redirects to the login page when there is no session. */
export async function requireStaff(): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) redirect("/admin/login");
  return s;
}

/** For admin pages limited to a minimum role: others are sent back to the dashboard. */
export async function requireRole(min: StaffRole): Promise<StaffSession> {
  const s = await requireStaff();
  if (!hasRole(s.role, min)) redirect("/admin?denied=1");
  return s;
}

export const requireAdmin = () => requireRole("admin");

/** For server actions: throws instead of redirecting. */
export async function assertStaff(min?: "admin" | "editor"): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) throw new Error("Your session has expired. Please sign in again.");
  if (min && !hasRole(s.role, min)) throw new Error(min === "admin" ? "Only administrators can do this." : "Your account cannot change website content.");
  return s;
}
