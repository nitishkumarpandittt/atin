import { Header, type NavItem } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CallbackDialog } from "@/components/site/CallbackDialog";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { getRanges } from "@/lib/data/catalogue";
import { getPublicCompany } from "@/lib/data/site";
import { nav, telHref } from "@/lib/site/config";

/**
 * Public page shell. Every public page opens with a dark hero (home hero or PageHero), so the
 * header is always transparent at the top and turns solid on scroll.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [ranges, company] = await Promise.all([getRanges(), getPublicCompany()]);
  const topRanges = [...ranges].sort((a, b) => b.productCount - a.productCount).slice(0, 6);

  const items: NavItem[] = nav.map((item) => {
    if (!("children" in item)) return { label: item.label, href: item.href };
    if (item.children === "ranges") {
      return {
        label: item.label,
        href: item.href,
        children: [
          { label: "All products", href: "/products" },
          { label: "New additions", href: "/products/new-additions" },
          ...topRanges.map((r) => ({ label: r.shortName, href: `/products/${r.slug}` })),
        ],
      };
    }
    const children: { label: string; href: string }[] = [...item.children];
    // Director's message appears in the menu only once it has been filled in.
    if (item.href === "/about" && company.director) children.splice(2, 0, { label: "Director's message", href: "/about#director" });
    return { label: item.label, href: item.href, children };
  });

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header items={items} overlay phone={company.phone ? { label: company.phone, href: telHref(company.phone) } : undefined} />
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <Footer ranges={ranges} company={company} />
      {company.whatsapp && <WhatsAppButton number={company.whatsapp} />}
      <CallbackDialog />
      <RevealObserver />
    </>
  );
}
