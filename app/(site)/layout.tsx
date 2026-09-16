import { SiteChrome } from "@/components/chrome/SiteChrome";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
