"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { DEFAULT_COOKIE_TEXT } from "@/app/shared/site-settings/schema";
import { OPEN_CONSENT_EVENT, readConsent, setConsent, subscribeConsent } from "@/app/shared/tracking";

export function CookieConsent({ text }: { text: string }) {
  // "ssr" keeps the banner out of server HTML so hydration matches.
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => "ssr" as const);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  function save(next: "granted" | "denied") {
    const previous = readConsent();
    setConsent(next);
    setReopened(false);
    // Tags that already loaded can't be unloaded; a reload clears them.
    if (next === "denied" && previous === "granted") window.location.reload();
  }

  if (!(reopened || choice === null)) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/15 sm:bottom-5"
    >
      <div className="flex gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" aria-hidden />
        <div className="text-sm leading-relaxed text-slate-700">
          <p>{text.trim() || DEFAULT_COOKIE_TEXT}</p>
          <Link href="/privacy" className="mt-1 inline-block font-semibold text-brand-red hover:underline">
            Privacy policy
          </Link>
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => save("denied")} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          Decline
        </button>
        <button type="button" onClick={() => save("granted")} className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
          Accept cookies
        </button>
      </div>
    </div>
  );
}
