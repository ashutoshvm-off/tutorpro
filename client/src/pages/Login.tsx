import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, Mail, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";

const isDev = import.meta.env.DEV;

async function devLogin(email: string, name: string) {
  const res = await fetch("/api/dev-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!res.ok) throw new Error("Dev login failed");
  return res.json();
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleDevLogin = async (role: "tutor" | "student") => {
    setLoading(true);
    setError("");
    try {
      const mockEmail = role === "tutor" ? "tutor@tutorflow.local" : "student@tutorflow.local";
      const mockName = role === "tutor" ? "Demo Tutor" : "Demo Student";
      await devLogin(mockEmail, mockName);
      // Redirect to the right dashboard
      window.location.href = role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
    } catch (err) {
      setError("Dev login failed. Check the server console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-grid px-5 py-6 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/tutorflow-logo.png" alt="TutorFlow logo" className="h-10 w-10 rounded-[13px] object-cover shadow-sm" />
          <span className="font-[Manrope] text-lg font-extrabold tracking-[-.04em]">tutor<span className="text-[#5b8d7b]">flow</span></span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>

      <main className="mx-auto grid max-w-5xl items-center gap-14 py-16 lg:grid-cols-[.85fr_1.15fr] lg:py-24">
        <div className="reveal">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-.055em] text-[#203336] sm:text-6xl">
            Pick up where your students left off.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Sign in to your TutorFlow workspace. We'll take you to the right dashboard automatically.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e0efe8] text-[#39705e]">
              <LockKeyhole className="h-4 w-4" />
            </span>
            Secure session, role-aware access
          </div>
        </div>

        <div className="glass reveal reveal-delay-1 rounded-[2rem] p-6 sm:p-9">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e4f1ea] text-[#39705e]">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Use your TutorFlow account · secure sign-in handoff</p>
            </div>
          </div>

          <label className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Email address</label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border bg-white/55 px-4 py-3 focus-within:border-[#5b8d7b] focus-within:ring-2 focus-within:ring-[#5b8d7b]/15">
            <Mail className="h-4 w-4 text-slate-400" />
            <input value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} required type="email" placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[.12em] text-slate-500">Password</label>
          <input value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} required type="password" placeholder="••••••••" className="mt-2 w-full rounded-2xl border bg-white/55 px-4 py-3 text-sm outline-none focus:border-[#5b8d7b] focus:ring-2 focus:ring-[#5b8d7b]/15" />

          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

          <div className="mt-3 flex justify-end">
            <button className="text-xs font-semibold text-[#39705e] hover:underline">Forgot password?</button>
          </div>

          <button
            onClick={() => { if (!email || !password) { setError("Enter your email and password to continue."); return; } startLogin(); }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#203a3a] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#203a3a]/15 hover:-translate-y-0.5"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>

          {isDev && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-amber-700">
                <Zap className="h-3.5 w-3.5" /> Dev Mode — Quick Login
              </div>
              <p className="mt-2 text-xs text-amber-600">No OAuth configured. Use these buttons to sign in instantly:</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDevLogin("tutor")}
                  disabled={loading}
                  className="rounded-xl bg-[#203a3a] px-4 py-2.5 text-xs font-bold text-white shadow hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in as Tutor"}
                </button>
                <button
                  onClick={() => handleDevLogin("student")}
                  disabled={loading}
                  className="rounded-xl border border-[#203a3a] px-4 py-2.5 text-xs font-bold text-[#203a3a] shadow hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in as Student"}
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            Continuing launches TutorFlow's configured secure sign-in flow; your role determines the right workspace.
          </p>
          <p className="mt-6 text-center text-sm text-slate-500">
            New to TutorFlow? <Link href="/signup" className="font-bold text-[#39705e]">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
