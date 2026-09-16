import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type StaffSession = {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result || result.user.banned) return null;
  const role = result.user.role === "admin" ? "admin" : "editor";
  return { userId: result.user.id, name: result.user.name, email: result.user.email, role };
});

/** For admin pages: redirects to the login page when there is no session. */
export async function requireStaff(): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function requireAdmin(): Promise<StaffSession> {
  const s = await requireStaff();
  if (s.role !== "admin") redirect("/admin?denied=1");
  return s;
}

/** For server actions: throws instead of redirecting. */
export async function assertStaff(role?: "admin"): Promise<StaffSession> {
  const s = await getStaffSession();
  if (!s) throw new Error("Your session has expired. Please sign in again.");
  if (role === "admin" && s.role !== "admin") throw new Error("Only administrators can do this.");
  return s;
}
