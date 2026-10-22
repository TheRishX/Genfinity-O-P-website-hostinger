"use client";

import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff, X } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 shadow-sm shadow-slate-900/[0.02] outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-400 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100";

export function cx(...items: (string | false | null | undefined)[]) {
  return items.filter(Boolean).join(" ");
}

export function Field({
  label,
  hint,
  error,
  counter,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  counter?: { value: number; ideal: [number, number]; max: number };
  optional?: boolean;
  className?: string;
  children: (id: string, invalid: boolean) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
          {optional && <span className="ml-1.5 text-xs font-normal text-slate-400">optional</span>}
        </label>
        {counter && <Counter {...counter} />}
      </div>
      {children(id, Boolean(error))}
      {counter && <CounterBar {...counter} />}
      {error ? (
        <p className="mt-1.5 text-[13px] font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function counterTone(value: number, ideal: [number, number], max: number) {
  if (value === 0) return "slate";
  if (value > max) return "red";
  if (value < ideal[0] || value > ideal[1]) return "amber";
  return "green";
}

function Counter({ value, ideal, max }: { value: number; ideal: [number, number]; max: number }) {
  const tone = counterTone(value, ideal, max);
  return (
    <span
      className={cx(
        "text-xs font-semibold tabular-nums",
        tone === "green" && "text-emerald-600",
        tone === "amber" && "text-amber-600",
        tone === "red" && "text-red-600",
        tone === "slate" && "text-slate-400",
      )}
    >
      {value}/{ideal[1]}
    </span>
  );
}

function CounterBar({ value, ideal, max }: { value: number; ideal: [number, number]; max: number }) {
  const tone = counterTone(value, ideal, max);
  return (
    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cx(
          "h-full rounded-full transition-all",
          tone === "green" && "bg-emerald-500",
          tone === "amber" && "bg-amber-400",
          tone === "red" && "bg-red-500",
        )}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="group flex w-full items-start gap-3 text-left">
      <span
        className={cx(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand-blue" : "bg-slate-300 group-hover:bg-slate-400",
        )}
      >
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      <span>
        <span className="block font-semibold text-slate-800">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-500">{description}</span>}
      </span>
    </button>
  );
}

export function Card({ title, description, icon, actions, children, className }: { title?: string; description?: ReactNode; icon?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue">{icon}</span>}
            <div>
              {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
              {description && <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{description}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Pill({ tone, children }: { tone: "green" | "amber" | "red" | "slate" | "blue"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "green" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        tone === "amber" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        tone === "red" && "bg-red-50 text-red-700 ring-1 ring-red-200",
        tone === "slate" && "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        tone === "blue" && "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20",
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          tone === "green" && "bg-emerald-500",
          tone === "amber" && "bg-amber-500",
          tone === "red" && "bg-red-500",
          tone === "slate" && "bg-slate-400",
          tone === "blue" && "bg-brand-blue",
        )}
      />
      {children}
    </span>
  );
}

export function SecretInput({ id, value, onChange, placeholder, invalid }: { id: string; value: string; onChange: (value: string) => void; placeholder: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        spellCheck={false}
        aria-invalid={invalid}
        className={cx(inputClass, "pr-11 font-mono")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-700" aria-label={show ? "Hide" : "Show"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/** Comma-separated value edited as chips. */
export function ChipInput({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const chips = value.split(",").map((item) => item.trim()).filter(Boolean);
  const commit = (raw: string) => {
    const additions = raw.split(",").map((item) => item.trim()).filter(Boolean);
    const next = [...chips];
    for (const item of additions) if (!next.some((chip) => chip.toLowerCase() === item.toLowerCase())) next.push(item);
    onChange(next.join(", "));
    setDraft("");
  };
  return (
    <div className="flex min-h-[46px] w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm shadow-slate-900/[0.02] transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10">
      {chips.map((chip) => (
        <span key={chip} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 py-1 pl-2.5 pr-1 text-[13px] font-medium text-slate-700">
          {chip}
          <button type="button" aria-label={`Remove ${chip}`} onClick={() => onChange(chips.filter((item) => item !== chip).join(", "))} className="grid h-5 w-5 place-items-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => (event.target.value.includes(",") ? commit(event.target.value) : setDraft(event.target.value))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && draft.trim()) {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Backspace" && !draft && chips.length) onChange(chips.slice(0, -1).join(", "));
        }}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={chips.length ? "Add keyword…" : placeholder}
        className="min-w-[160px] flex-1 border-0 bg-transparent px-1.5 py-1 text-[15px] outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
