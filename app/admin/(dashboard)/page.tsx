import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, Circle, Inbox, Layers, Package, PhoneCall, Sparkles } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, formatDateTime } from "@/components/admin/ui";
import { getDashboardData } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const session = await requireStaff();
  const [data, sp] = await Promise.all([getDashboardData(), searchParams]);
  const done = data.checklist.filter((c) => c.done).length;
  const pct = Math.round((done / data.checklist.length) * 100);

  const stats = [
    { label: "Products", value: data.stats.products, sub: `${data.stats.published} published`, icon: Package, href: "/admin/products" },
    { label: "Ranges", value: data.stats.ranges, sub: `${data.stats.isNew} new additions`, icon: Layers, href: "/admin/ranges" },
    { label: "New enquiries", value: data.stats.enquiriesNew, sub: "waiting to be handled", icon: Inbox, href: "/admin/enquiries" },
    { label: "New callbacks", value: data.stats.callbacksNew, sub: "waiting to be handled", icon: PhoneCall, href: "/admin/callbacks" },
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${session.name.split(" ")[0]}`} description="An overview of the catalogue, contacts and website content." />

      {sp.denied === "1" && (
        <p role="alert" className="mb-5 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900">
          That page is only available to administrators.
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="block h-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-line transition hover:ring-blue-300 sm:p-5">
              <span className="flex items-center justify-between text-sm font-medium text-muted">
                {label} <Icon aria-hidden className="size-4" />
              </span>
              <span className="mt-2 block text-3xl font-bold text-ink">{value}</span>
              <span className="mt-1 block text-xs text-muted">{sub}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card
          title="Latest contacts"
          actions={
            <Link href="/admin/enquiries" className="text-sm font-medium text-blue-700 hover:underline">
              View all
            </Link>
          }
        >
          {data.latest.length === 0 ? (
            <EmptyState title="No enquiries yet" text="Enquiries and callback requests from the website will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {data.latest.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/${e.kind === "callback" ? "callbacks" : "enquiries"}#e-${e.id}`} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {e.name}
                        {e.organisation && <span className="font-normal text-muted"> · {e.organisation}</span>}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {e.kind === "callback" ? `Callback · ${e.phone}` : e.productLabel || e.message || e.phone}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone={e.status === "new" ? "green" : "grey"}>{e.status === "new" ? "New" : "Handled"}</Badge>
                      <span className="text-xs text-muted">{formatDateTime(e.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Website content" description={`${done} of ${data.checklist.length} complete`}>
          <div className="px-4 pt-4 sm:px-5">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Website content completeness">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <ul className="px-2 py-3 sm:px-3">
            {data.checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  {c.done ? <CircleCheck aria-hidden className="size-4 shrink-0 text-emerald-600" /> : <Circle aria-hidden className="size-4 shrink-0 text-slate-300" />}
                  <span className={c.done ? "text-muted line-through decoration-slate-300" : "text-ink"}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Catalogue checks" className="mt-6">
        <ul className="divide-y divide-line">
          {data.catalogueChecks.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-slate-50 sm:px-5">
                <span className="flex items-center gap-2.5">
                  <Sparkles aria-hidden className={`size-4 ${c.value ? "text-amber-500" : "text-slate-300"}`} />
                  {c.label}
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={c.value ? "amber" : "green"}>{c.value}</Badge>
                  <ArrowRight aria-hidden className="size-4 text-muted" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
