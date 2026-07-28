"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export function LandingFooter() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <footer className={`border-t transition-colors duration-200 ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-950 text-slate-300 border-slate-900"}`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-rose-500/20">
                🛡️
              </div>
              <span className={`font-black text-lg tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>DebtProof</span>
            </div>
            <p className={`text-xs leading-relaxed max-w-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Never lose proof of your loan repayments. Powered by SHA-256 cryptographic hashing 
              and Monad Blockchain for unalterable, 100% legally verifiable payment records.
            </p>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              A product by <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Sanatan Labs</span>
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500">
              Product Navigation
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="#features" className={`${isLight ? "text-slate-600 hover:text-rose-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  Features Showcase
                </a>
              </li>
              <li>
                <a href="#how-it-works" className={`${isLight ? "text-slate-600 hover:text-rose-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#security" className={`${isLight ? "text-slate-600 hover:text-rose-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  Blockchain Security
                </a>
              </li>
              <li>
                <a href="#pricing" className={`${isLight ? "text-slate-600 hover:text-rose-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  5-Tier Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-500">
              Legal & Compliance
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="#" className={`${isLight ? "text-slate-600 hover:text-purple-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className={`${isLight ? "text-slate-600 hover:text-purple-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className={`${isLight ? "text-slate-600 hover:text-purple-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  RBI & CIBIL Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className={`${isLight ? "text-slate-600 hover:text-purple-600" : "text-slate-400 hover:text-white"} transition-colors`}>
                  Monad Blockchain Audit Log
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${isLight ? "border-slate-200" : "border-slate-900"}`}>
          <p className={`text-xs font-medium ${isLight ? "text-slate-500" : "text-slate-500"}`}>
            © {new Date().getFullYear()} DebtProof — Sanatan Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-500 font-bold">Built on Monad Testnet (10,000 TPS)</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
