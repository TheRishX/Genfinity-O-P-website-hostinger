"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the error boundary intentionally quiet for visitors while Next.js
    // still reports the error through its normal server-side logging.
  }, []);

  return (
    <main className="bg-slate-50 px-4 py-24 text-center sm:px-6">
      <BookOpen className="mx-auto h-12 w-12 text-brand-red" />
      <h1 className="mt-5 text-3xl font-bold text-brand-ink">
        Our articles are temporarily unavailable.
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        The learning center could not connect to its content service. Please
        try again, or return to the main site.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 font-bold text-brand-ink"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
