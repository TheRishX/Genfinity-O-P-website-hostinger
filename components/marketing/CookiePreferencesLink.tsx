"use client";

import { OPEN_CONSENT_EVENT } from "@/app/shared/tracking";

export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Cookie Preferences
    </button>
  );
}
