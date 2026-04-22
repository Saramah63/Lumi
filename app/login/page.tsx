"use client";

import { FormEvent, useMemo, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/lumi";
  if (value.startsWith("/login")) return "/lumi";
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error === "not_configured" ? "Lumi access is not configured yet." : "Email or password is incorrect.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_35%_25%,rgba(126,231,255,0.22),transparent_34%),linear-gradient(135deg,#0B1020,#141B3A_52%,#1A2452)] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[32px] border border-white/12 bg-white/[0.08] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/80">LumiFriends</p>
            <h1 className="mt-3 text-3xl font-bold">Paid access</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Sign in with your Lumi product account to open the classroom app.
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-100">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/14 bg-slate-950/45 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200 focus:bg-slate-950/60"
                placeholder="teacher@example.com"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-100">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/14 bg-slate-950/45 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200 focus:bg-slate-950/60"
                placeholder="••••••••"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 font-bold text-slate-950 shadow-[0_14px_36px_rgba(45,212,191,0.28)] transition hover:translate-y-[-1px] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Open Lumi"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-300">
            No child data is required for access. Session observations stay group-level only.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0B1020]" />}>
      <LoginForm />
    </Suspense>
  );
}
