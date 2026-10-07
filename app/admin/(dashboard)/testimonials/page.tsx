import type { Metadata } from "next";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { TestimonialForm } from "@/components/admin/RecordForms";
import { deleteTestimonial } from "@/lib/admin/actions/content";
import { listTestimonials } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireRole("editor");
  const rows = await listTestimonials();
  return (
    <>
      <PageHeader title="Testimonials" description="Trade partner quotes for the home page. The section stays hidden until one has permission and is published." />
      <Card title="Add a testimonial" className="mb-6">
        <div className="p-4 sm:p-5">
          <TestimonialForm value={{ quote: "", name: "", role: "", organisation: "", hasPermission: false, isPublished: false, sortOrder: (rows.at(-1)?.sortOrder ?? 0) + 10 }} submitLabel="Add testimonial" />
        </div>
      </Card>
      <Card title={`${rows.length} testimonials`}>
        {rows.length === 0 ? (
          <EmptyState title="No testimonials yet" />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((t) => (
              <li key={t.id} className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {t.isPublished && t.hasPermission ? <Badge tone="green">Live on website</Badge> : <Badge>Not shown</Badge>}
                  {!t.hasPermission && <Badge tone="amber">No permission</Badge>}
                </div>
                <TestimonialForm value={t} submitLabel="Save" />
                <div className="mt-2">
                  <ActionButton action={deleteTestimonial} fields={{ id: t.id }} variant="danger" confirm={`Delete the testimonial from ${t.name}?`}>
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
