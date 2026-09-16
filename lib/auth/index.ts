import "server-only";
import { db } from "@/lib/db";
import { createAuth } from "@/lib/auth/options";

export const auth = createAuth(db);
