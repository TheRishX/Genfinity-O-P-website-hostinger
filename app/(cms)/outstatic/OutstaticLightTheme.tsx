"use client";

import { useEffect } from "react";

/** Outstatic defaults to the OS theme; this CMS is intentionally light-only. */
export function OutstaticLightTheme() {
  useEffect(() => {
    const forceLight = () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
      try {
        window.localStorage.setItem("theme", "light");
      } catch {
        // Storage can be disabled in private browsing; CSS still enforces light mode.
      }
    };

    forceLight();
  }, []);

  return null;
}
