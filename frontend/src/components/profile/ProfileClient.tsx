"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { User } from "@/types";

export function ProfileClient() {
  const { user: authUser } = useAuth();
  const { currency, updateSettings } = useCurrency();

  const [user, setUser] = useState<User | null>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    bio: "",
    occupation: "Software Engineer",
    monthly_income: "85000",
    emergency_contact: "+91 98765 43210",
    repayment_strategy: "avalanche",
    email_notifications: true,
    sms_notifications: false,
  });

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFormData((prev) => ({
        ...prev,
        first_name: authUser.first_name || "",
        last_name: authUser.last_name || "",
        email: authUser.email || "",
        phone_number: authUser.phone_number || "",
        bio: authUser.bio || "",
      }));
    } else {
      // Fallback demo user if not logged into backend API yet
      const savedLocalUser = localStorage.getItem("debtproof_demo_user");
      if (savedLocalUser) {
        try {
          const parsed = JSON.parse(savedLocalUser);
          setUser(parsed);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
          }));
        } catch {
          /* ignore */
        }
      } else {
        const defaultDemo: User = {
          id: "usr-1",
          email: "abhimanyu@debtproof.io",
          first_name: "Abhimanyu",
          last_name: "Vaishnav",
          full_name: "Abhimanyu Vaishnav",
          phone_number: "+91 98765 43210",
          avatar: null,
          avatar_url: null,
          bio: "Managing personal investments, mutual funds, and loan portfolios.",
          is_email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(defaultDemo);
        setFormData((prev) => ({
          ...prev,
          first_name: defaultDemo.first_name,
          last_name: defaultDemo.last_name,
          email: defaultDemo.email,
          phone_number: defaultDemo.phone_number,
          bio: defaultDemo.bio,
        }));
      }
    }
  }, [authUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      if (authUser) {
        const updated = await authService.updateProfile({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
        });
        setUser(updated);
      } else {
        // Update local state and demo storage
        const updatedUser: User = {
          id: user?.id || "usr-1",
          email: formData.email || user?.email || "user@debtproof.io",
          first_name: formData.first_name,
          last_name: formData.last_name,
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
          phone_number: formData.phone_number,
          avatar: user?.avatar || null,
          avatar_url: user?.avatar_url || null,
          bio: formData.bio,
          is_email_verified: user?.is_email_verified ?? true,
          created_at: user?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(updatedUser);
        localStorage.setItem("debtproof_demo_user", JSON.stringify({ ...updatedUser, ...formData }));
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setError("Failed to update profile details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordData.current) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordData.newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (passwordData.newPass !== passwordData.confirmPass) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordSuccess(true);
    setPasswordData({ current: "", newPass: "", confirmPass: "" });
    setTimeout(() => {
      setPasswordSuccess(false);
      setIsPasswordModalOpen(false);
    }, 2000);
  };

  const initials = `${formData.first_name?.[0] || "U"}${formData.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ── Status Banners ── */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span>✓</span> Profile details updated successfully!
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Header Card ── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-white/10">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-[var(--color-text-primary)]">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`
                  : "User Profile"}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pro Member
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1 flex items-center gap-2">
              <span>✉️ {formData.email || "user@debtproof.io"}</span>
              <span className="text-emerald-400 font-semibold">• Verified Account</span>
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic">
              &quot;{formData.bio || "Optimizing debt payoffs and wealth accumulation."}&quot;
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all shrink-0 ${
            isEditing
              ? "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              : "bg-[var(--color-primary)] text-white hover:opacity-95"
          }`}
        >
          {isEditing ? "Cancel Editing" : "✎ Edit Profile"}
        </button>
      </div>

      {/* ── Personal Information Form / View ── */}
      <form onSubmit={handleProfileSave} className="space-y-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                <span>👤</span> Personal Information
              </h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Your credentials provided during signup and personal details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]">
                  {formData.first_name || "—"}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]">
                  {formData.last_name || "—"}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Email Address
              </label>
              <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
                <span>{formData.email || "user@debtproof.io"}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]">
                  {formData.phone_number || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Occupation / Profession
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]">
                  {formData.occupation}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Monthly Estimated Income (₹)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.monthly_income}
                  onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]">
                  ₹{parseInt(formData.monthly_income || "0").toLocaleString("en-IN")} / month
                </div>
              )}
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                Bio / Personal Financial Objective
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)]">
                  {formData.bio || "No bio set."}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                {isSaving ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* ── Financial Preferences Section ── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <span>⚙️</span> Financial & App Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
              Primary Display Currency
            </label>
            <select
              value={currency.code}
              onChange={(e) => updateSettings({ currencyCode: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ US Dollar)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
              Default Repayment Strategy
            </label>
            <select
              value={formData.repayment_strategy}
              onChange={(e) => setFormData({ ...formData, repayment_strategy: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="avalanche">Debt Avalanche (Highest Interest First - Recommended)</option>
              <option value="snowball">Debt Snowball (Lowest Balance First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Security & Authentication ── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <span>🔒</span> Security & Login Credentials
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Password</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              Protect your account with a strong password.
            </p>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-xs transition-all shrink-0"
          >
            Change Password
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Blockchain Anchoring (Monad ZK-Proof)</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              Generate tamper-proof debt payoff credentials.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Active on Testnet
          </span>
        </div>

        {/* PWA Install Trigger in Profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">📱 Install Mobile / Desktop App (PWA)</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              Add DebtProof to your Home Screen for faster loads, offline access, and native app experience.
            </p>
          </div>
          <button
            onClick={() => {
              const dismissKey = "debtproof-pwa-dismiss";
              localStorage.removeItem(dismissKey);
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs hover:opacity-90 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            📲 Reset & Install App
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <span>⚠️</span> Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Permanently remove your account profile, investments, and loan tracking data. This action cannot be undone.
          </p>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete your account? This action is permanent.")) {
                alert("Account deletion request logged.");
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-rose-400 font-bold text-xs transition-all shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Change Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ✓ Password changed successfully!
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPass}
                  onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPass}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white font-semibold shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
