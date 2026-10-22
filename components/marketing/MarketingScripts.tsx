"use client";

// Loads marketing tags only after the visitor accepts cookies. No consent, nothing loads.
import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import type { PublicTracking } from "@/app/shared/site-settings/schema";
import { hasConsent, pushEvent, subscribeConsent } from "@/app/shared/tracking";

export function MarketingScripts({ config }: { config: PublicTracking }) {
  const ok = useSyncExternalStore(subscribeConsent, hasConsent, () => false);

  // click_to_call on every tel: link (header, footer, sticky call bar, page CTAs).
  useEffect(() => {
    if (!ok) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (link) pushEvent("click_to_call", { link_url: link.getAttribute("href") ?? "", page_path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [ok]);

  if (!ok) return null;
  const { gtm, ga4, metaPixel, googleAds, stapeUrl, serverSide } = config;
  const gtmHost = stapeUrl || "https://www.googletagmanager.com";
  const gtagId = ga4 || googleAds?.id;
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

  // Script ids are prefixed: a <script id="gtag"> would shadow window.gtag (named element access).
  return (
    <>
      <Script id="mkt-init" strategy="afterInteractive">
        {`window.__MKT_LOADED=true;window.dataLayer=window.dataLayer||[];window.__ADS=${json(googleAds)};window.__SERVER_TRACKING=${serverSide ? "true" : "false"};`}
      </Script>

      {gtm && (
        <Script id="mkt-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src=${json(gtmHost)}+'/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${json(gtm)});`}
        </Script>
      )}

      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`} strategy="afterInteractive" />
          <Script id="mkt-gtag" strategy="afterInteractive">
            {`if(typeof window.gtag!=='function')window.gtag=function(){dataLayer.push(arguments);};window.gtag('js',new Date());${ga4 ? `window.gtag('config',${json(ga4)});` : ""}${googleAds ? `window.gtag('config',${json(googleAds.id)});` : ""}`}
          </Script>
        </>
      )}

      {metaPixel && (
        <Script id="mkt-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${json(metaPixel)});fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
