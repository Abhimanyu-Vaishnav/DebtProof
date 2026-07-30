/**
 * DebtProof — Premium Register Page v2
 * Minimal · Split Screen · High-Contrast
 */
"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

const INITIAL_FORM: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirm: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors]     = useState<Partial<FormData>>({});
  const [loading, setLoading]   = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!formData.first_name.trim()) e.first_name = "First name is required.";
    if (!formData.last_name.trim())  e.last_name  = "Last name is required.";
    if (!formData.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email.";
    if (!formData.password) e.password = "Password is required.";
    else if (formData.password.length < 8) e.password = "Minimum 8 characters.";
    if (formData.password !== formData.password_confirm) e.password_confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(formData);
      router.push("/dashboard");
    } catch (err: any) {
      let message = err?.response?.data?.error?.message;
      if (!message && err?.response?.data?.error?.details?.email) {
        const emailErr = err.response.data.error.details.email;
        message = Array.isArray(emailErr) ? emailErr[0] : emailErr;
      }
      if (!message && err?.response?.data?.email) {
        const emailErr = err.response.data.email;
        message = Array.isArray(emailErr) ? emailErr[0] : emailErr;
      }
      setGlobalError(message ?? err?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="auth-layout">
      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div className="auth-panel">
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
            <h3 className="text-white text-2xl font-bold leading-tight">Secure by design.</h3>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              We never read your receipts. Only the SHA-256 hash is anchored on Monad Blockchain.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Privacy Promise</p>
            <p className="text-[13px] text-indigo-100/80 leading-relaxed">
              Your documents stay encrypted and private. Only the cryptographic fingerprint is stored publicly — your data never is.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-white/80">Free plan — No credit card needed</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="w-full max-w-[400px] space-y-6">
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
              Create your account
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors">
                Sign in →
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="register-first-name"
                label="First name"
                placeholder="Arjun"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={set("first_name")}
                error={errors.first_name}
                required
              />
              <Input
                id="register-last-name"
                label="Last name"
                placeholder="Sharma"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={set("last_name")}
                error={errors.last_name}
                required
              />
            </div>

            <Input
              id="register-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={set("email")}
              error={errors.email}
              required
            />

            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={formData.password}
              onChange={set("password")}
              error={errors.password}
              hint="Use at least 8 characters with letters and numbers."
              required
            />

            <Input
              id="register-password-confirm"
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={formData.password_confirm}
              onChange={set("password_confirm")}
              error={errors.password_confirm}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              id="register-submit-btn"
              className="mt-1 !rounded-xl"
            >
              Create free account
            </Button>
          </form>

          <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)] transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
