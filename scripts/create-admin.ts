// Creates an administrator account.
//   npm run admin:create -- --email you@example.com --name Your Name
// The password is typed at a hidden prompt; it is never passed on the command line.
import { createAuth } from "../lib/auth/options";
import { connect, describeDbError } from "./db";
import { promptHidden } from "./prompt";

function argValue(flag: string): string {
  const args = process.argv.slice(2);
  const i = args.indexOf(flag);
  if (i === -1) return "";
  // Collect every word up to the next flag, so an unquoted multi-word name still works (PowerShell drops quotes).
  const words: string[] = [];
  for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) words.push(args[j]);
  return words.join(" ").trim();
}

async function main() {
  const email = argValue("--email").toLowerCase();
  const name = argValue("--name");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
    console.error("Usage: npm run admin:create -- --email you@example.com --name Your Name");
    process.exit(1);
  }
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
    console.error("BETTER_AUTH_SECRET must be set in .env.local (at least 32 random characters).");
    process.exit(1);
  }

  const password = await promptHidden("Password (min 12 characters): ");
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }
  const confirm = await promptHidden("Repeat password: ");
  if (confirm !== password) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const { db, pool } = connect();
  try {
    const auth = createAuth(db);
    await auth.api.createUser({ body: { email, password, name, role: "admin" } });
    console.log(`Administrator ${email} created. Sign in at /admin/login.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(describeDbError(e));
  process.exit(1);
});
