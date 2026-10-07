// Sets a new password for an existing staff account and signs it out everywhere.
//   npm run admin:reset-password -- --email you@example.com
// The password is typed twice at a hidden prompt; it is never passed on the command line.
import { hashPassword } from "better-auth/crypto";
import type { RowDataPacket } from "mysql2";
import { connect, describeDbError } from "./db";
import { promptHidden } from "./prompt";

async function main() {
  const i = process.argv.indexOf("--email");
  const email = (i === -1 ? "" : (process.argv[i + 1] ?? "")).trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run admin:reset-password -- --email you@example.com");
    process.exit(1);
  }

  const { pool } = connect();
  try {
    const [users] = await pool.query<RowDataPacket[]>("select id, name, role from user where email = ? limit 1", [email]);
    const user = users[0];
    if (!user) {
      const [all] = await pool.query<RowDataPacket[]>("select email, role from user order by created_at");
      console.error(`No account with the email ${email}.`);
      if (all.length) console.error(`Accounts in this database: ${all.map((u) => `${u.email} (${u.role ?? "editor"})`).join(", ")}`);
      process.exit(1);
    }

    const password = await promptHidden(`New password for ${user.name} (${user.role}), at least 12 characters: `);
    if (password.length < 12) throw new Error("Use at least 12 characters.");
    if ((await promptHidden("Type it again: ")) !== password) throw new Error("The two passwords do not match.");

    const hash = await hashPassword(password);
    const [res] = await pool.query<import("mysql2").ResultSetHeader>("update account set password = ? where user_id = ? and provider_id = 'credential'", [hash, user.id]);
    if (res.affectedRows === 0) throw new Error("This account has no password login to update.");
    await pool.query("delete from session where user_id = ?", [user.id]);
    console.log(`Password updated for ${email}. Old sessions were signed out; sign in at /admin/login.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error && !("code" in e) ? e.message : describeDbError(e));
  process.exit(1);
});
