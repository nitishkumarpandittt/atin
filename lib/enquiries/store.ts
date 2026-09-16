import "server-only";
import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type EnquiryRecord = {
  id: string;
  kind: "enquiry" | "callback";
  createdAt: string;
  emailStatus: "pending" | "sent" | "failed" | "not-configured";
  data: Record<string, string>;
};

// Interim storage until the MySQL `enquiries` table lands: one JSON object per line.
const dir = () => path.resolve(/*turbopackIgnore: true*/ process.env.ENQUIRY_STORE_DIR ?? path.join(process.cwd(), "storage"));

export function newRecord(kind: EnquiryRecord["kind"], data: Record<string, string>): EnquiryRecord {
  return { id: randomUUID(), kind, createdAt: new Date().toISOString(), emailStatus: "pending", data };
}

async function appendLine(line: object) {
  const target = dir();
  await mkdir(target, { recursive: true });
  await appendFile(path.join(target, "enquiries.jsonl"), JSON.stringify(line) + "\n", "utf8");
}

export async function saveRecord(record: EnquiryRecord): Promise<boolean> {
  try {
    await appendLine(record);
    return true;
  } catch (error) {
    console.error("[enquiries] could not save record", record.id, error);
    return false;
  }
}

/** Appends a status event; the latest event for an id wins when the file is imported. */
export async function saveEmailStatus(id: string, emailStatus: EnquiryRecord["emailStatus"]) {
  try {
    await appendLine({ id, event: "email-status", emailStatus, at: new Date().toISOString() });
  } catch (error) {
    console.error("[enquiries] could not save email status", id, error);
  }
}
