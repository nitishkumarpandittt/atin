// Database connection for command-line scripts (the app's lib/db is server-only).
import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../lib/db/schema";

loadEnvConfig(process.cwd());

export function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }
  const pool = mysql.createPool({ uri: url, connectionLimit: 4, timezone: "Z", multipleStatements: false });
  pool.on("connection", (conn) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return { pool, db: drizzle(pool, { schema, mode: "default" }) };
}

export { schema };

/** Drizzle wraps driver errors as "Failed query"; surface the MySQL error and a likely fix. */
export function describeDbError(e: unknown): string {
  const err = (e as { cause?: unknown })?.cause ?? e;
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  const hints: Record<string, string> = {
    ER_ACCESS_DENIED_ERROR: "MySQL rejected the username or password in DATABASE_URL. Check them, and URL-encode special characters in the password (e.g. @ -> %40, # -> %23).",
    ER_BAD_DB_ERROR: "The database in DATABASE_URL does not exist. Run: CREATE DATABASE atin_healthcare CHARACTER SET utf8mb4;",
    ER_DBACCESS_DENIED_ERROR: "The user has no rights on this database. Run: GRANT ALL PRIVILEGES ON atin_healthcare.* TO 'atin_app'@'localhost';",
    ER_TABLEACCESS_DENIED_ERROR: "The user cannot create tables. Grant ALL PRIVILEGES on the database to this user.",
    ECONNREFUSED: "Nothing is listening at the host/port in DATABASE_URL. Is MySQL running on localhost:3306?",
    ENOTFOUND: "The host in DATABASE_URL could not be found.",
    ERR_INVALID_URL: "DATABASE_URL is not a valid URL. Format: mysql://user:password@localhost:3306/atin_healthcare",
  };
  return [`Database error${code ? ` (${code})` : ""}: ${message ?? String(err)}`, code && hints[code] ? `
Fix: ${hints[code]}` : ""].join("");
}
