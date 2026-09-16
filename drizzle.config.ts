import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

// Plain object (drizzle-kit accepts it without defineConfig), so typechecking does not depend on the CLI package.
const config = {
  dialect: "mysql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
};

export default config;
