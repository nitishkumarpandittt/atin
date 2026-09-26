"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import logo from "@/public/brand/atin-logo.png";
import logoWhite from "@/public/brand/atin-logo-white.png";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

type Props = {
  items: NavItem[];
  phone?: { label: string; href: string };
  /** Transparent header over a dark hero until the page scrolls. */
  overlay?: boolean;
};

export function Header({ items, phone, overlay = false }: Props) {
  const pathname = usePathname();
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const hoverOpened = useRef(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Close menus on route change (derived during render), outside click and Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = !overlay || scrolled || mobileOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]));

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-6" />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          solid ? "bg-white/95 text-navy shadow-[0_6px_24px_-12px_rgb(10_31_102/0.25)] backdrop-blur" : "bg-transparent text-white"
        }`}
      >
        <div className="container-site flex h-[4.5rem] items-center justify-between gap-4 md:h-20 xl:gap-6">
          <Link href="/" className="relative shrink-0" aria-label="Atin HealthCare home">
            <Image
              src={solid ? logo : logoWhite}
              alt=""
              className="h-11 w-auto md:h-[3.4rem]"
              loading="eager"
              sizes="100px"
            />
          </Link>

          <nav ref={navRef} aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const active = isActive(item.href);
                if (!item.children?.length) {
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`relative rounded-full px-3 py-2 text-[0.95rem] font-medium transition-colors xl:px-4 ${
                          solid ? "hover:text-brand" : "hover:text-white/75"
                        } ${active ? (solid ? "text-brand" : "") : ""}`}
                      >
                        {item.label}
                        {active && <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-leaf xl:inset-x-4" />}
                      </Link>
                    </li>
                  );
                }
                const open = openMenu === item.label;
                const menuId = `menu-${item.label.toLowerCase()}`;
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      hoverOpened.current = true;
                      setOpenMenu(item.label);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType !== "mouse") return;
                      hoverOpened.current = false;
                      setOpenMenu((m) => (m === item.label ? null : m));
                    }}
                  >
                    {/* The label is a real link to the section page; the chevron toggles the menu. */}
                    <div className={`relative flex items-center ${active && solid ? "text-brand" : ""}`}>
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={`rounded-full py-2 pl-3 pr-0.5 text-[0.95rem] font-medium transition-colors xl:pl-4 ${
                          solid ? "hover:text-brand" : "hover:text-white/75"
                        }`}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={menuId}
                        aria-label={`${item.label} menu`}
                        onClick={() => {
                          if (open && hoverOpened.current) return;
                          setOpenMenu(open ? null : item.label);
                        }}
                        className={`grid size-8 place-items-center rounded-full transition-colors ${solid ? "hover:bg-surface" : "hover:bg-white/15"}`}
                      >
                        <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {active && <span aria-hidden className="absolute -bottom-0.5 left-3 right-8 h-0.5 rounded-full bg-leaf xl:left-4" />}
                    </div>
                    {/* suppressHydrationWarning: extensions such as Bitdefender add attributes to hidden wrappers before hydration. */}
                    <div id={menuId} hidden={!open} suppressHydrationWarning className="absolute left-0 top-full pt-3">
                      <ul className="min-w-60 rounded-2xl bg-white p-2 text-navy shadow-lift ring-1 ring-line">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              aria-current={pathname === c.href ? "page" : undefined}
                              className="block rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-surface hover:text-brand aria-[current=page]:text-brand"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={phone.href}
                // Over the hero the number crosses the white gap between the panels, so it sits on a translucent pill.
                className={`hidden items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold xl:flex ${
                  solid ? "text-navy" : "bg-navy/40 text-white ring-1 ring-white/15 backdrop-blur-sm"
                }`}
              >
                <span className={`grid size-9 place-items-center rounded-full ${solid ? "bg-leaf-100 text-green" : "bg-white/15"}`}>
                  <Phone aria-hidden className="size-4" />
                </span>
                {phone.label}
              </a>
            )}
            <Link href="/contact" className="btn btn-green hidden px-5 sm:inline-flex xl:px-[1.6rem]">
              Send an enquiry
            </Link>
            <button
              type="button"
              className={`grid size-11 place-items-center rounded-full lg:hidden ${solid ? "bg-surface text-navy" : "bg-white/15 text-white"}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </div>

        {/* suppressHydrationWarning: see the dropdown above. */}
        <div
          id="mobile-menu"
          hidden={!mobileOpen}
          suppressHydrationWarning
          className="h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-line bg-white pb-[env(safe-area-inset-bottom)] text-navy md:h-[calc(100dvh-5rem)] lg:hidden"
        >
          <nav aria-label="Mobile" className="container-site py-6">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="block rounded-xl px-3 py-3 text-lg font-semibold hover:bg-surface aria-[current=page]:text-brand"
                  >
                    {item.label}
                  </Link>
                  {item.children?.length ? (
                    <ul className="mb-2 ml-3 border-l-2 border-leaf-100 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-lg px-3 py-2 text-[0.95rem] text-muted hover:text-brand">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3">
              <Link href="/contact" className="btn btn-green">
                Send an enquiry
              </Link>
              {phone && (
                <a href={phone.href} className="btn btn-blue">
                  <Phone aria-hidden className="size-4" /> {phone.label}
                </a>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
