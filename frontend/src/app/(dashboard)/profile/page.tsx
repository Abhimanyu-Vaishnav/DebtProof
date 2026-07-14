/**
 * DebtProof — Profile Page
 */
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Profile" subtitle="Manage your account information" />
      <main className="page-content max-w-3xl space-y-5">
        {/* Profile Header */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name="User" size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Your Profile
                </h1>
                <Badge variant="neutral">Free Plan</Badge>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Sign in to see your profile details.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm shrink-0"
              id="edit-profile-btn"
            >
              Edit Profile
            </button>
          </div>
        </Card>

        {/* Personal Information */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "First Name", placeholder: "—" },
              { label: "Last Name", placeholder: "—" },
              { label: "Email Address", placeholder: "—" },
              { label: "Phone Number", placeholder: "Not set" },
            ].map(({ label, placeholder }) => (
              <div key={label} className="form-group">
                <label className="form-label">{label}</label>
                <div className="form-input text-[var(--color-text-tertiary)] cursor-default">
                  {placeholder}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Password</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Last changed — never</p>
              </div>
              <button className="btn btn-secondary btn-sm" id="change-password-btn">
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Email Verification</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Verify your email to unlock all features</p>
              </div>
              <Badge variant="warning">Unverified</Badge>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card padding="lg" className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              className="btn bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 btn-sm shrink-0 transition-colors"
              id="delete-account-btn"
            >
              Delete Account
            </button>
          </div>
        </Card>
      </main>
    </>
  );
}
