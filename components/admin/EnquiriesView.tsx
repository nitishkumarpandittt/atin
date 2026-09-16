import Link from "next/link";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Pagination, formatDateTime } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/form";
import { deleteEnquiry, setEnquiryStatus } from "@/lib/admin/actions/content";
import { listEnquiries } from "@/lib/admin/queries";

const EMAIL_TONE = { sent: "green", failed: "red", "not-configured": "grey", pending: "amber" } as const;
const EMAIL_LABEL = { sent: "Email sent", failed: "Email failed", "not-configured": "Email not set up", pending: "Email pending" } as const;

export async function EnquiriesView({ kind, status, page }: { kind: "enquiry" | "callback"; status: "new" | "handled" | "all"; page: number }) {
  const { rows, total, pages } = await listEnquiries(kind, status, page);
  const base = kind === "callback" ? "/admin/callbacks" : "/admin/enquiries";
  const title = kind === "callback" ? "Callback requests" : "Enquiries";
  const tabs = [
    { value: "new", label: "New" },
    { value: "handled", label: "Handled" },
    { value: "all", label: "All" },
  ] as const;

  return (
    <>
      <PageHeader title={title} description={kind === "callback" ? "People who asked to be called back." : "Trade enquiries sent from the website contact form."} />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={t.value === "new" ? base : `${base}?status=${t.value}`}
              aria-current={status === t.value ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === t.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {t.label}
            </Link>
          ))}
          <span className="ml-auto text-sm text-muted">{total} total</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState title={status === "new" ? "Nothing new" : "Nothing here yet"} text={status === "new" ? "All caught up. New submissions will appear here." : undefined} />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map(({ e, productSlug, productRangeSlug }) => (
              <li key={e.id} id={`e-${e.id}`} className="scroll-mt-20 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {e.name}
                      {e.organisation && <span className="font-normal text-muted"> · {e.organisation}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {[e.role, e.city, e.preferredTime && `Best time: ${e.preferredTime}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={e.status === "new" ? "green" : "grey"}>{e.status === "new" ? "New" : "Handled"}</Badge>
                    <span title={e.emailError ?? undefined}>
                      <Badge tone={EMAIL_TONE[e.emailStatus]}>{EMAIL_LABEL[e.emailStatus]}</Badge>
                    </span>
                    <span className="text-xs text-muted">{formatDateTime(e.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:underline">
                    <Phone aria-hidden className="size-4" /> {e.phone}
                  </a>
                  {e.email && (
                    <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1.5 break-all font-medium text-blue-700 hover:underline">
                      <Mail aria-hidden className="size-4" /> {e.email}
                    </a>
                  )}
                  {e.productLabel &&
                    (productSlug && productRangeSlug ? (
                      <Link href={`/products/${productRangeSlug}/${productSlug}`} target="_blank" className="inline-flex items-center gap-1.5 text-ink hover:underline">
                        Product: {e.productLabel} <ExternalLink aria-hidden className="size-3.5" />
                      </Link>
                    ) : (
                      <span className="text-ink">Product: {e.productLabel}</span>
                    ))}
                </div>

                {e.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-ink">{e.message}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {e.status === "new" ? (
                    <ActionButton action={setEnquiryStatus} fields={{ id: e.id, status: "handled" }} variant="primary">
                      Mark handled
                    </ActionButton>
                  ) : (
                    <ActionButton action={setEnquiryStatus} fields={{ id: e.id, status: "new" }}>
                      Mark as new
                    </ActionButton>
                  )}
                  <ActionButton action={deleteEnquiry} fields={{ id: e.id }} variant="danger" confirm={`Delete this ${kind === "callback" ? "callback request" : "enquiry"} from ${e.name}? This cannot be undone.`}>
                    Delete
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pages={pages} hrefFor={(p) => `${base}?${new URLSearchParams({ ...(status !== "new" ? { status } : {}), page: String(p) })}`} />
      </Card>
    </>
  );
}

export const parseStatus = (v: string | string[] | undefined): "new" | "handled" | "all" => (v === "handled" || v === "all" ? v : "new");
