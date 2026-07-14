/**
 * DebtProof — 404 Not Found Page
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | DebtProof",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)] flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold text-[var(--color-primary)] leading-none mb-4 tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
          Page Not Found
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.{" "}
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary" id="not-found-home-btn">
            Go to Homepage
          </Link>
          <Link href="/dashboard" className="btn btn-secondary" id="not-found-dashboard-btn">
            Open Dashboard
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-12 text-xs text-[var(--color-text-tertiary)]">
          DebtProof by Sanatan Labs
        </div>
      </div>
    </div>
  );
}
