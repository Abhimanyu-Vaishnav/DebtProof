/**
 * DebtProof — Premium Login Page v2
 * Minimal · Split Screen · High-Contrast
 */
"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData]     = useState({ email: "", password: "" });
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email address.";
    if (!formData.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : undefined;
      setGlobalError(message ?? "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div className="auth-panel">
        {/* Floating glowing orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xs text-center space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-black tracking-tight">DebtProof</h2>
              <p className="text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mt-0.5">Monad FinTech</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white text-2xl font-bold leading-tight">Proof of every payment.</h3>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              Immutable blockchain records that protect you from disputed EMIs and credit defaults.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              { icon: "🔒", label: "Monad blockchain-anchored receipts" },
              { icon: "🤖", label: "AI Debt Destroyer assistant" },
              { icon: "📄", label: "Zero-debt clearance certificates" },
              { icon: "📊", label: "Credit score & risk tracking" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <span className="text-[13px] text-indigo-100/90 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Monad live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-white/80">Monad Testnet Active • 10,000 TPS</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="w-full max-w-[400px] space-y-7">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-bold text-[var(--color-text-primary)] tracking-tight">DebtProof</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors">
                Create one free →
              </Link>
            </p>
          </div>

          {/* Error */}
          {globalError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400 font-medium" role="alert">
              {globalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <div className="space-y-2.5">
              <Input
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--color-text-secondary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                  />
                  Stay signed in
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              id="login-submit-btn"
              className="mt-1 !rounded-xl"
            >
              Sign in to DebtProof
            </Button>
          </form>

          <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)] transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
