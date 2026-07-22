/**
 * DebtProof — Login Page
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
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      {/* Left Brand Panel */}
      <div className="auth-panel">
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Welcome back</h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Your loan repayment proofs are secured on Monad Blockchain. 
            Sign in to access your dashboard.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {["Immutable payment proof", "Multi-loan tracking", "EMI reminders"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-blue-100 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-[var(--color-text-primary)]">DebtProof</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1.5">
            Sign in to your account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            {"Don't have an account? "}
            <Link href="/register" className="font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]">
              Create one free
            </Link>
          </p>

          {globalError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-700" role="alert">
              {globalError}
            </div>
          )}

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
            <div>
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
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-surface-secondary)] cursor-pointer"
                  />
                  <span>Stay signed in on this device</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--color-primary-light)] hover:text-[var(--color-primary)] font-medium"
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
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)]">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-[var(--color-text-secondary)]">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
