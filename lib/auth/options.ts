import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "@/lib/db/schema";
import { site } from "@/lib/site/config";

export const ac = createAccessControl(defaultStatements);
// Admins manage staff; editors manage website content only (no user permissions).
export const roles = {
  admin: ac.newRole(adminAc.statements),
  editor: ac.newRole({ user: [], session: [] }),
};

function trustedOrigins(): string[] {
  const list = [site.url, process.env.SITE_URL, process.env.BETTER_AUTH_URL];
  for (const o of (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(",")) list.push(o.trim());
  if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV !== "production") list.push("http://localhost:3000", "http://localhost:3100", "http://127.0.0.1:3000", "http://127.0.0.1:3100");
  return [...new Set(list.filter((o): o is string => Boolean(o)))];
}

export function createAuth(db: MySql2Database<typeof schema>) {
  return betterAuth({
    appName: "Atin HealthCare Admin",
    // A blank variable (as on a fresh Vercel project) falls back to the resolved site origin.
    baseURL: process.env.BETTER_AUTH_URL?.trim() || site.url,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: trustedOrigins(),
    database: drizzleAdapter(db, { provider: "mysql", schema }),
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    plugins: [admin({ ac, roles, defaultRole: "editor", adminRoles: ["admin"] }), nextCookies()],
  });
}
