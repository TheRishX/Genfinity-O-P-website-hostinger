"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export function ResetOwnerPassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function updatePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (
      password.length < 12 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        "Use at least 12 characters with uppercase, lowercase, a number, and a symbol.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/staff/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to update the password");
      router.replace("/staff/login");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update the password",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200/60 sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white">
        <KeyRound className="h-6 w-6" />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-brand-red">
        Secure owner access
      </p>
      <h1 className="mt-3 text-3xl font-bold text-brand-ink">
        Set your portal password
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Use a unique password with at least 12 characters, including uppercase,
        lowercase, a number, and a symbol.
      </p>
      <form onSubmit={updatePassword} className="mt-8 space-y-5">
        <label className="block text-sm font-semibold text-brand-ink">
          New password
          <input
            required
            minLength={12}
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-brand-red"
          />
        </label>
        <label className="block text-sm font-semibold text-brand-ink">
          Confirm new password
          <input
            required
            minLength={12}
            autoComplete="new-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-brand-red"
          />
        </label>
        <button
          disabled={busy || !token}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3.5 font-bold text-white disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          {busy ? "Saving…" : "Save password"}
        </button>
      </form>
      {!token && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-brand-red">
          This password reset link is missing or invalid. Request a new link from
          the owner login page.
        </p>
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
