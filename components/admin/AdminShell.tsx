"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Building2, ExternalLink, ImageIcon, Inbox, LayoutDashboard, Layers, LogOut, Menu, MessageSquareQuote, Package, PhoneCall, SearchCheck, Users, X } from "lucide-react";
import logo from "@/public/brand/atin-logo.png";
import logoWhite from "@/public/brand/atin-logo-white.png";
import { authClient } from "@/lib/auth/client";

type Props = {
  children: React.ReactNode;
  user: { name: string; email: string; role: "admin" | "editor" | "staff" };
  counts: { enquiries: number; callbacks: number };
};

/** `min`: lowest role that sees the item (staff < editor < admin); the server enforces the same rule. */
type Item = { href: string; label: string; icon: typeof Package; count?: number; min?: "editor" | "admin" };

const RANK = { staff: 1, editor: 2, admin: 3 } as const;

export function AdminShell({ children, user, counts }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups: { title?: string; items: Item[] }[] = [
    { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/ranges", label: "Ranges", icon: Layers },
      ],
    },
    {
      title: "People who contacted us",
      items: [
        { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, count: counts.enquiries },
        { href: "/admin/callbacks", label: "Callback requests", icon: PhoneCall, count: counts.callbacks },
      ],
    },
    {
      title: "Website content",
      items: [
        { href: "/admin/company", label: "Company details", icon: Building2, min: "editor" },
        { href: "/admin/site-images", label: "Site images", icon: ImageIcon, min: "editor" },
        { href: "/admin/credentials", label: "Credentials", icon: BadgeCheck, min: "editor" },
        { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, min: "editor" },
        { href: "/admin/seo", label: "SEO & tracking", icon: SearchCheck, min: "editor" },
      ],
    },
    { title: "Settings", items: [{ href: "/admin/staff", label: "Staff accounts", icon: Users, min: "admin" }] },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav aria-label="Admin" className="admin-scroll flex-1 overflow-y-auto px-3 py-4">
      {groups.map((g, gi) => {
        const items = g.items.filter((i) => !i.min || RANK[user.role] >= RANK[i.min]);
        if (!items.length) return null;
        return (
          <div key={gi} className={gi ? "mt-5" : ""}>
            {g.title && <p className="px-3 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">{g.title}</p>}
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, count }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon aria-hidden className="size-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {count ? <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">{count}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link href="/" target="_blank" className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
        <ExternalLink aria-hidden className="size-4" /> View website
      </Link>
      <div className="mt-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
          <span className="block truncate text-xs capitalize text-slate-400">{user.role}</span>
        </span>
        <button type="button" onClick={signOut} aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white">
          <LogOut aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-theme min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy-950 lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <Image src={logoWhite} alt="Atin HealthCare" className="h-9 w-auto" sizes="100px" />
          <span className="border-l border-white/20 pl-2.5 text-sm font-semibold text-slate-300">Admin</span>
        </Link>
        {nav}
        {footer}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src={logo} alt="Atin HealthCare" className="h-7 w-auto" sizes="80px" />
          <span className="text-sm font-semibold text-muted">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid size-10 place-items-center rounded-lg hover:bg-surface">
          <Menu aria-hidden className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-950">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <span className="flex items-center gap-2.5">
                <Image src={logoWhite} alt="Atin HealthCare" className="h-8 w-auto" sizes="100px" />
                <span className="border-l border-white/20 pl-2.5 text-sm font-semibold text-slate-300">Admin</span>
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
