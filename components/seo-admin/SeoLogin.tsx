"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Eye, EyeOff, Lock, Search, ShieldCheck } from "lucide-react";

export function SeoLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/seo-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-ink p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-brand-red/30 blur-3xl" />
        <div className="relative">
          <Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} priority className="h-11 w-auto object-contain object-left brightness-0 invert" />
        </div>
        <div className="relative mt-auto max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-300">Growth console</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Search, social and tracking in one place.</h1>
          <ul className="mt-10 space-y-5 text-[15px] text-slate-300">
            {[
              [Search, "Live Google and social previews for every page"],
              [BarChart3, "GTM, GA4, Meta Pixel, Google Ads and CAPI with one switch each"],
              [ShieldCheck, "Consent-gated scripts. Secrets never reach the browser."],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Search;
              return (
                <li key={text as string} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
                    <I className="h-4 w-4" />
                  </span>
                  <span className="pt-1">{text as string}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Image src="/images/brand/genfinity-logo-uploaded.webp" alt="Genfinity O&P" width={1100} height={275} priority className="mb-10 h-10 w-auto object-contain object-left lg:hidden" />
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <Lock className="h-5 w-5" />
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">SEO admin sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Restricted area for authorized Genfinity staff.</p>

          {!configured ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
              <p className="font-bold">Password not set up yet</p>
              <p className="mt-1">
                Add <code className="rounded bg-amber-100 px-1">SEO_ADMIN_PASSWORD</code> to the server&apos;s environment variables, then restart the app.
              </p>
            </div>
          ) : (
            <form onSubmit={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <div className="relative mt-1.5">
                  <input
                    required
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-[15px] outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
                  />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-slate-700">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
              <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {busy ? "Signing in…" : "Sign in"}
                {!busy && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
