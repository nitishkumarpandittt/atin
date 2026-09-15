import { Header, type NavItem } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { getRanges } from "@/lib/data/catalogue";
import { nav, site, telHref } from "@/lib/site/config";

export async function SiteChrome({ children, overlayHeader = false }: { children: React.ReactNode; overlayHeader?: boolean }) {
  const ranges = await getRanges();
  const topRanges = [...ranges].sort((a, b) => b.productCount - a.productCount).slice(0, 6);

  const items: NavItem[] = nav.map((item) => {
    if (!("children" in item)) return { label: item.label, href: item.href };
    if (item.children === "ranges") {
      return {
        label: item.label,
        href: item.href,
        children: [
          { label: "All products", href: "/products" },
          ...topRanges.map((r) => ({ label: r.shortName, href: `/products/${r.slug}` })),
        ],
      };
    }
    return { label: item.label, href: item.href, children: [...item.children] };
  });

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header items={items} overlay={overlayHeader} phone={site.phone ? { label: site.phone, href: telHref(site.phone) } : undefined} />
      <main id="main" className={`overflow-x-clip ${overlayHeader ? "" : "pt-20"}`}>
        {children}
      </main>
      <Footer ranges={ranges} />
      <RevealObserver />
    </>
  );
}
