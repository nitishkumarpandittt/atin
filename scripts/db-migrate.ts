// Applies committed SQL migrations from ./drizzle (no drizzle-kit needed at runtime).
import { migrate } from "drizzle-orm/mysql2/migrator";
import { connect, describeDbError } from "./db";

async function main() {
  const { db, pool } = connect();
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(describeDbError(e));
  process.exit(1);
});
