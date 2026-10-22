"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, hasConsent, pushEvent } from "@/app/shared/tracking";

/** Pushes one dataLayer event when the page opens (or when consent is given later). */
export function TrackEvent({ event, data }: { event: string; data?: Record<string, string> }) {
  const serialized = JSON.stringify(data ?? {});
  useEffect(() => {
    const payload = JSON.parse(serialized);
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      // Give MarketingScripts a tick to create dataLayer.
      setTimeout(() => pushEvent(event, payload), 0);
    };
    if (hasConsent()) send();
    window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, [event, serialized]);
  return null;
}
