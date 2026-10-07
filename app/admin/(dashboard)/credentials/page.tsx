import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { CredentialForm } from "@/components/admin/RecordForms";
import { deleteCredential } from "@/lib/admin/actions/content";
import { listCredentials } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Credentials" };

export default async function CredentialsPage() {
  await requireRole("editor");
  const rows = await listCredentials();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title="Credentials" description="Licences and registrations listed on the Quality & certifications page. Until one is published, the page says details are available on request." />
      <Card title="Add a credential" className="mb-6">
        <div className="p-4 sm:p-5">
          <CredentialForm value={{ name: "", issuingAuthority: "", number: "", validUntil: "", isPublished: true, sortOrder: (rows.at(-1)?.sortOrder ?? 0) + 10 }} submitLabel="Add credential" />
        </div>
      </Card>
      <Card title={`${rows.length} credentials`}>
        {rows.length === 0 ? (
          <EmptyState title="No credentials yet" text="Add verified licence details above." />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((c) => (
              <li key={c.id} className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {c.isPublished ? <Badge tone="green">Published</Badge> : <Badge>Hidden</Badge>}
                  {c.validUntil && c.validUntil < today && <Badge tone="red">Expired</Badge>}
                </div>
                <CredentialForm value={c} submitLabel="Save" />
                <div className="mt-2">
                  <ActionButton action={deleteCredential} fields={{ id: c.id }} variant="danger" confirm={{ title: "Delete credential?", message: `"${c.name}" is removed from the website.`, confirmLabel: "Delete credential" }}>
                    Delete
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
