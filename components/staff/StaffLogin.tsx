"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function StaffLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_OWNER_EMAIL || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await createBrowserSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (result.error) throw result.error;
      router.push("/staff/intakes");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/staff/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send the password setup link");
      setNotice(
        result.message || "A secure password setup link has been sent to the owner email.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send the password setup link",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!configured)
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-950">
        <h1 className="text-2xl font-bold">Owner portal is not configured</h1>
        <p className="mt-3 leading-relaxed">
          Add the Supabase URL, anonymous key, service-role key, and owner email
          to the server environment before signing in.
        </p>
      </div>
    );

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-10">
      <Image
        src="/images/brand/genfinity-logo-uploaded.webp"
        alt="Genfinity O&P"
        width={1100}
        height={275}
        priority
        className="h-auto w-[220px] object-contain object-left"
      />
      <h1 className="mt-9 text-3xl font-bold text-brand-ink">
        Welcome back
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Sign in once to open the patient workspace. You stay signed in on this
        device until you choose Sign out.
      </p>
      <form onSubmit={signIn} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-brand-ink">
            Owner email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold text-brand-ink">
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-brand-red"
            />
          </label>
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Open patient workspace"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>
          <button
            type="button"
            disabled={busy || !email}
            onClick={sendPasswordReset}
            className="w-full text-center text-sm font-semibold text-brand-red underline-offset-4 hover:underline disabled:opacity-50"
          >
            Set or reset owner password
          </button>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-brand-red"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
