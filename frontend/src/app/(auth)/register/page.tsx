/**
 * DebtProof — Register Page
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
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.password_confirm)
      newErrors.password_confirm = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : undefined;
      setGlobalError(message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="auth-layout">
      {/* Left Brand Panel */}
      <div className="auth-panel">
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Secure by Design</h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Your data is protected with industry-standard encryption. 
            Receipts are hashed before storage — we never see your documents.
          </p>
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-2">
              Privacy Promise
            </p>
            <p className="text-sm text-blue-100 leading-relaxed">
              DebtProof never reads or stores the content of your receipts. 
              Only the cryptographic hash (digital fingerprint) is anchored on blockchain.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-bold text-[var(--color-text-primary)]">DebtProof</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1.5">
            Create your account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)]">
              Sign in
            </Link>
          </p>

          {globalError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-sm text-red-700" role="alert">
              {globalError}
            </div>
          )}

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
              hint="Use at least 8 characters with a mix of letters and numbers."
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
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-5">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline">Terms</a>
            {" "}and{" "}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
