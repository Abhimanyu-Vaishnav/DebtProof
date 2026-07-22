/**
 * DebtProof — Landing Navbar
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav
      className={cn(
        "nav-landing transition-shadow duration-200",
        scrolled && "shadow-sm"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="DebtProof home">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-bold text-[var(--color-text-primary)] text-[15px] tracking-tight">
            DebtProof
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-md hover:bg-[var(--color-surface-tertiary)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth Buttons / Logged In User State */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-[var(--color-text-primary)] leading-none">
                    {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.email}
                  </p>
                  <p className="text-[9px] font-bold text-emerald-500 mt-0.5">● Dashboard</p>
                </div>
              </Link>
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-secondary btn-sm"
                id="nav-login-btn"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm"
                id="nav-register-btn"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-tertiary)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-surface-tertiary)]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link href="/dashboard" className="btn btn-primary btn-sm w-full justify-center">
                  Dashboard ({user.first_name || user.email})
                </Link>
                <button onClick={() => logout()} className="btn btn-secondary btn-sm w-full justify-center text-rose-500">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm w-full justify-center">Sign In</Link>
                <Link href="/register" className="btn btn-primary btn-sm w-full justify-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
