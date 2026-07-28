"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-rose-500/20">
                🛡️
              </div>
              <span className="font-black text-white text-lg tracking-tight">DebtProof</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Never lose proof of your loan repayments. Powered by SHA-256 cryptographic hashing 
              and Monad Blockchain for unalterable, 100% legally verifiable payment records.
            </p>
            <p className="text-xs text-slate-500">
              A product by <span className="font-bold text-white">Sanatan Labs</span>
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-400">
              Product Navigation
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                  Features Showcase
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#security" className="text-slate-400 hover:text-white transition-colors">
                  Blockchain Security
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                  5-Tier Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">
              Legal & Compliance
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  RBI & CIBIL Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  Monad Blockchain Audit Log
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} DebtProof — Sanatan Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400">Built on Monad Testnet (10,000 TPS)</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
