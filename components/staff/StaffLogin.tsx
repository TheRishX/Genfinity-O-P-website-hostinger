"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function StaffLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_OWNER_EMAIL || "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qr, setQr] = useState("");
  const [stage, setStage] = useState<"password" | "mfa">("password");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function prepareMfa() {
    const supabase = createBrowserSupabase();
    const factors = await supabase.auth.mfa.listFactors();
    const verified = factors.data?.totp.find(
      (factor) => factor.status === "verified",
    );
    let id = verified?.id;
    if (!id) {
      const enrolled = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Genfinity owner portal",
      });
      if (enrolled.error || !enrolled.data)
        throw enrolled.error || new Error("Unable to enroll MFA");
      id = enrolled.data.id;
      setQr(enrolled.data.totp.qr_code);
    }
    const challenge = await supabase.auth.mfa.challenge({ factorId: id });
    if (challenge.error || !challenge.data)
      throw challenge.error || new Error("Unable to start MFA");
    setFactorId(id);
    setChallengeId(challenge.data.id);
    setStage("mfa");
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await createBrowserSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (result.error) throw result.error;
      await prepareMfa();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await createBrowserSupabase().auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });
      if (result.error) throw result.error;
      router.push("/staff/intakes");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Invalid authenticator code",
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
    <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200/60 sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white">
        <LockKeyhole className="h-6 w-6" />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-brand-red">
        Restricted access
      </p>
      <h1 className="mt-3 text-3xl font-bold text-brand-ink">
        Genfinity owner portal
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Individual authentication and an authenticator code are required before
        patient records can be viewed.
      </p>
      {stage === "password" ? (
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
            <KeyRound className="h-4 w-4" />
            {busy ? "Signing in…" : "Continue securely"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 space-y-5">
          {qr && (
            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <p className="mb-4 text-sm font-semibold text-brand-ink">
                Scan once with your authenticator app
              </p>
              {/* Authenticator enrollment is supplied as a one-time data URI. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="Authenticator enrollment QR code"
                className="mx-auto h-44 w-44"
              />
            </div>
          )}
          <label className="block text-sm font-semibold text-brand-ink">
            Six-digit authenticator code
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-center font-mono text-xl tracking-[.3em] outline-none focus:border-brand-red"
            />
          </label>
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            {busy ? "Verifying…" : "Verify & open portal"}
          </button>
        </form>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-brand-red"
        >
          {error}
        </p>
      )}
    </div>
  );
}
