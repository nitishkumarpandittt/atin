import type { Metadata } from "next";
import { EnquiriesView, parseStatus } from "@/components/admin/EnquiriesView";
import { requireStaff } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireStaff();
  const sp = await searchParams;
  return <EnquiriesView kind="enquiry" status={parseStatus(sp.status)} page={Number(sp.page) || 1} />;
}
