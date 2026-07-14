/**
 * DebtProof — Forgot Password Page
 */
"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Email is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    setLoading(true);
    // Simulated — real API endpoint will be added in Day 2
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-[var(--color-text-primary)] text-lg tracking-tight">DebtProof</span>
          </div>
        </div>

        <div className="card p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Check your email</h1>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
                If an account exists for <span className="font-semibold">{email}</span>,{" "}
                we&apos;ve sent password reset instructions to that address.
              </p>
              <Link href="/login" className="btn btn-primary w-full justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1.5">
                  Reset your password
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Input
                  id="forgot-email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  required
                />
                <Button type="submit" fullWidth loading={loading} id="forgot-submit-btn">
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-sm text-[var(--color-primary-light)] hover:text-[var(--color-primary)] font-medium">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
