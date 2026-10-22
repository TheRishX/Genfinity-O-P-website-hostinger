// Client-side marketing event helpers (dataLayer, Google Ads, Meta Pixel).
// Healthcare site: never pass names, phones, emails, conditions or form text here.

export const CONSENT_KEY = "cookie_consent";
export const CONSENT_EVENT = "cookie-consent-granted";
export const OPEN_CONSENT_EVENT = "open-cookie-preferences";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  __ADS?: { id: string; label: string } | null;
  __SERVER_TRACKING?: boolean;
};

const w = () => (typeof window === "undefined" ? null : (window as TrackingWindow));

const CONSENT_CHANGE_EVENT = "cookie-consent-changed";
export type ConsentChoice = "granted" | "denied" | null;

/** Stored choice; Global Privacy Control (CCPA/CPRA opt-out) counts as "denied" until the visitor chooses. */
export function readConsent(): ConsentChoice {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    /* storage blocked */
  }
  const gpc = typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  return gpc ? "denied" : null;
}

export function hasConsent() {
  return readConsent() === "granted";
}

export function setConsent(choice: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  // Banner contract from the spec: Accept dispatches "cookie-consent-granted".
  if (choice === "granted") window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** For useSyncExternalStore. */
export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function pushEvent(event: string, data: Record<string, string | number | boolean | undefined> = {}) {
  const win = w();
  if (!win || !hasConsent()) return;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event, ...data });
}

export function newLeadId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Call once after a consultation / contact form is submitted successfully. */
export function trackLead({ leadId, formName = "consultation_request" }: { leadId: string; formName?: string }) {
  const win = w();
  if (!win || !hasConsent()) return;
  const key = `lead_${leadId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked: still send once for this call */
  }

  pushEvent("generate_lead", { form_name: formName, lead_id: leadId });
  if (win.__ADS?.label && win.gtag) {
    win.gtag("event", "conversion", {
      send_to: `${win.__ADS.id}/${win.__ADS.label}`,
      value: 1.0,
      currency: "USD",
      transaction_id: leadId,
    });
  }
  win.fbq?.("track", "Lead", { content_name: formName }, { eventID: leadId });
  if (win.__SERVER_TRACKING) {
    fetch("/api/track/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, formName, pageUrl: location.href }),
      keepalive: true,
    }).catch(() => {});
  }
}
