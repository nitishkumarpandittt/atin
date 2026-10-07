import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { assertStaff, type StaffSession } from "@/lib/auth/dal";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Monotonic token so forms can react to repeated identical results. */
  at?: number;
};

export const idle: ActionState = { status: "idle" };

export const ok = (message: string): ActionState => ({ status: "success", message, at: Date.now() });
export const fail = (message: string, fieldErrors?: Record<string, string>): ActionState => ({ status: "error", message, fieldErrors, at: Date.now() });

export function zodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Prerendered public pages refresh after every admin write. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

/**
 * Runs an admin mutation: checks the session first and turns thrown errors into a form message.
 * Every successful mutation re-renders the whole admin panel (lists, badges, sidebar counts), so no
 * page needs a manual refresh after a change; actions that also affect the public site call refreshSite().
 */
export async function guarded(role: "admin" | "editor" | undefined, fn: (session: StaffSession) => Promise<ActionState>): Promise<ActionState> {
  let session: StaffSession;
  try {
    session = await assertStaff(role);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Not allowed.");
  }
  try {
    const result = await fn(session);
    if (result.status === "success") revalidatePath("/admin", "layout");
    return result;
  } catch (e) {
    unstable_rethrow(e); // redirect()/notFound() must propagate
    const code = (e as { code?: string; cause?: { code?: string } })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
    if (code === "ER_DUP_ENTRY") return fail("That slug is already used. Choose a different one.", { slug: "Already used" });
    console.error("[admin] action failed", e);
    return fail("Something went wrong while saving. Please try again.");
  }
}

export const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
