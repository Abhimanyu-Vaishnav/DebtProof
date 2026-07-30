"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security",     href: "#security" },
  { label: "Pricing",      href: "#pricing" },
];

export function LandingNavbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { resolvedTheme, setTheme }   = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const isLight = resolvedTheme === "light";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        isLight
          ? scrolled
            ? "bg-white/95 border-black/8 backdrop-blur-xl shadow-sm shadow-black/5"
            : "bg-white/80 border-black/5 backdrop-blur-md"
          : scrolled
            ? "bg-[#0c0f1a]/95 border-white/7 backdrop-blur-xl shadow-xl shadow-black/40"
            : "bg-[#0c0f1a]/75 border-white/5 backdrop-blur-md"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="DebtProof Home">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span className={`font-black text-[15px] tracking-tight block leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
              DebtProof
            </span>
            <span className="text-[9px] font-bold text-indigo-400 tracking-widest uppercase leading-none">
              Monad FinTech
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[13px] font-medium transition-colors ${
                isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                : "bg-white/8 border-white/10 text-slate-300 hover:bg-white/12"
            }`}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? "🌙" : "☀️"}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[12px] font-semibold cursor-pointer ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-800 hover:border-indigo-300"
                    : "bg-white/8 border-white/10 text-white hover:border-indigo-500/50"
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-[9px] flex items-center justify-center">
                  {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className={`px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition cursor-pointer ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    : "bg-white/8 border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`px-3.5 py-1.5 rounded-xl border text-[13px] font-semibold transition ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                    : "bg-white/8 border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[13px] transition shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-white/8 border-white/10"
            }`}
          >
            {isLight ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
              isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-white/8 border-white/10 text-white"
            }`}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className={`md:hidden px-5 py-4 border-t space-y-4 animate-fade-in ${
          isLight ? "bg-white border-black/7" : "bg-[#0c0f1a] border-white/7"
        }`}>
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className={`pt-3 border-t ${isLight ? "border-black/7" : "border-white/7"}`}>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-center text-[13px] font-bold block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`py-2.5 rounded-xl text-center text-[13px] font-semibold border ${
                    isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-white/8 border-white/10 text-white"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 rounded-xl bg-indigo-600 text-white text-center text-[13px] font-bold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
