import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { getCompany } from "@/lib/data/site";
import { requireStaff } from "@/lib/auth/dal";
import { uploadUrl } from "@/lib/uploads/url";

export const metadata: Metadata = { title: "Company details" };

export default async function CompanyPage() {
  await requireStaff();
  const company = await getCompany();
  return (
    <>
      <PageHeader title="Company details" description="Contact information, profile, vision and mission, and the director's message." />
      <CompanyForm values={company} photoUrl={company.directorPhotoPath ? uploadUrl(company.directorPhotoPath) : ""} />
    </>
  );
}
