import type { Metadata } from "next";
import { EnquiriesView, parseStatus } from "@/components/admin/EnquiriesView";
import { requireStaff } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Callback requests" };

export default async function CallbacksPage({ searchParams }: PageProps<"/admin/callbacks">) {
  await requireStaff();
  const sp = await searchParams;
  return <EnquiriesView kind="callback" status={parseStatus(sp.status)} page={Number(sp.page) || 1} />;
}
