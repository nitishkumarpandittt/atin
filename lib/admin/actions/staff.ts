"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { fail, guarded, ok, str, zodErrors, type ActionState } from "@/lib/admin/action-utils";

const role = z.enum(["admin", "editor", "staff"], { message: "Choose a role." });
const password = z.string().min(12, "Use at least 12 characters.").max(128);

function authError(e: unknown): string {
  const body = (e as { body?: { message?: string } })?.body;
  return body?.message || (e instanceof Error ? e.message : "The request could not be completed.");
}

export async function createStaff(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("admin", async () => {
    const parsed = z
      .object({
        name: z.string().trim().min(2, "Name is required.").max(120),
        email: z.email("Enter a valid email.").max(191),
        role,
        password,
      })
      .safeParse({ name: str(fd, "name"), email: str(fd, "email").trim().toLowerCase(), role: str(fd, "role"), password: str(fd, "password") });
    if (!parsed.success) return fail("Please check the highlighted fields.", zodErrors(parsed.error));
    try {
      await auth.api.createUser({ headers: await headers(), body: parsed.data });
    } catch (e) {
      const msg = authError(e);
      return /exist/i.test(msg) ? fail("Please check the highlighted fields.", { email: "An account with this email already exists." }) : fail(msg);
    }
    return ok(`Account created for ${parsed.data.email}. Share the password with them securely.`);
  });
}

export async function setStaffRole(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("admin", async (session) => {
    const userId = str(fd, "userId");
    const parsed = role.safeParse(str(fd, "role"));
    if (!parsed.success) return fail("Choose a role.");
    if (userId === session.userId && parsed.data !== "admin") return fail("You cannot remove your own administrator role.");
    try {
      await auth.api.setRole({ headers: await headers(), body: { userId, role: parsed.data } });
    } catch (e) {
      return fail(authError(e));
    }
    return ok("Role updated.");
  });
}

export async function resetStaffPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("admin", async (session) => {
    const userId = str(fd, "userId");
    const parsed = password.safeParse(str(fd, "newPassword"));
    if (!parsed.success) return fail("Please check the highlighted fields.", { newPassword: parsed.error.issues[0].message });
    try {
      const h = await headers();
      await auth.api.setUserPassword({ headers: h, body: { userId, newPassword: parsed.data } });
      // Sign the person out everywhere so the old password stops working immediately.
      if (userId !== session.userId) await auth.api.revokeUserSessions({ headers: h, body: { userId } });
    } catch (e) {
      return fail(authError(e));
    }
    return ok(userId === session.userId ? "Your password was changed." : "Password reset and all their sessions signed out.");
  });
}

export async function removeStaff(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded("admin", async (session) => {
    const userId = str(fd, "userId");
    if (userId === session.userId) return fail("You cannot remove your own account.");
    try {
      await auth.api.removeUser({ headers: await headers(), body: { userId } });
    } catch (e) {
      return fail(authError(e));
    }
    return ok("Account removed.");
  });
}
