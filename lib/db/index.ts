import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/lib/db/schema";

type Pool = mysql.Pool;

const globalForDb = globalThis as unknown as { atinPool?: Pool };

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  // Parallel prerender workers during `next build` would otherwise exhaust MySQL connections.
  const building = process.env.NEXT_PHASE === "phase-production-build";
  const pool = mysql.createPool({
    uri: url,
    connectionLimit: building ? 2 : 10,
    timezone: "Z",
    dateStrings: false,
    supportBigNumbers: true,
  });
  pool.on("connection", (conn) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return pool;
}

const pool = globalForDb.atinPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.atinPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
