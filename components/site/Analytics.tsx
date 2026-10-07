import Script from "next/script";
import { GA4_ID, META_PIXEL_ID, getSeoSettings } from "@/lib/data/seo";

/**
 * Google Analytics 4 and Meta Pixel for the public site, configured in Admin → SEO. Only rendered
 * by SiteChrome, so the admin panel is never tracked. IDs are re-checked against their strict
 * format before they are written into an inline script.
 */
export async function Analytics() {
  const { ga4Id, metaPixelId } = await getSeoSettings();
  const ga = GA4_ID.test(ga4Id) ? ga4Id : "";
  const pixel = META_PIXEL_ID.test(metaPixelId) ? metaPixelId : "";
  if (!ga && !pixel) return null;

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          {/* GA4's enhanced measurement records client-side navigations from browser history. */}
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${ga}");`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","${pixel}");fbq("track","PageView");`}
        </Script>
      )}
    </>
  );
}
