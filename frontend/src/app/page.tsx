"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      badge: "STARTER",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Essential loan tracking for individuals with basic EMI monitoring needs.",
      maxLoans: "Up to 2 Active Loans",
      features: [
        "Track up to 2 active loans",
        "Basic EMI payment calendar",
        "Manual receipt document upload",
        "Community support",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/register",
      popular: false,
    },
    {
      id: "basic",
      name: "Basic Plan",
      badge: "ESSENTIAL",
      priceMonthly: 299,
      priceYearly: 2990,
      description: "Blockchain cryptographic proof anchoring for serious borrowers.",
      maxLoans: "Up to 5 Active Loans",
      features: [
        "Track up to 5 active loans",
        "Monad Blockchain SHA-256 anchoring",
        "Email & SMS payment due alerts",
        "Export CSV financial reports",
      ],
      ctaText: "Choose Basic",
      ctaHref: "/register?plan=basic",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro Plan",
      badge: "MOST POPULAR",
      priceMonthly: 999,
      priceYearly: 9990,
      description: "Full AI Debt Destroyer suite & zero-debt clearance certificates.",
      maxLoans: "Up to 15 Active Loans",
      features: [
        "Track up to 15 active loans",
        "AI Debt Destroyer Assistant",
        "Snowball vs Avalanche Simulator",
        "Zero-Debt PDF Clearance Certificates",
        "Monad Blockchain QR verification",
        "24/7 Priority Support SLA",
      ],
      ctaText: "Start Pro Trial",
      ctaHref: "/register?plan=pro",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium Plan",
      badge: "ADVANCED",
      priceMonthly: 2499,
      priceYearly: 24990,
      description: "Automated credit score tracking & 30-day predictive risk heatmaps.",
      maxLoans: "Unlimited Loans",
      features: [
        "Unlimited active loans",
        "Automated CIBIL score tracking",
        "30-Day Default Risk Heatmap",
        "Web3 Monad Escrow Vault inspection",
        "Dedicated Financial Advisor",
      ],
      ctaText: "Get Premium",
      ctaHref: "/register?plan=premium",
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      badge: "INSTITUTIONAL",
      priceMonthly: 4999,
      priceYearly: 49990,
      description: "Whitelabel custom branding, staff RBAC, and credit bureau exports.",
      maxLoans: "Unlimited Enterprise",
      features: [
        "Whitelabel Custom Domain & Logo",
        "Multi-tenant staff RBAC matrix",
        "Quarterly CIBIL/Experian export",
        "1-Click System Cache Studio",
        "Dedicated API & SLA guarantee",
      ],
      ctaText: "Contact Enterprise",
      ctaHref: "/register?plan=enterprise",
      popular: false,
    },
  ];

  const featuresShowcase = [
    {
      icon: "🛡️",
      title: "Monad Blockchain Cryptographic Proofs",
      desc: "Every repayment receipt is SHA-256 hashed and anchored on Monad Blockchain (10,000 TPS). Your payment proof remains immutable and legally indisputable forever.",
    },
    {
      icon: "🤖",
      title: "AI Debt Destroyer & Payoff Simulator",
      desc: "Compare Avalanche (highest interest rate first) vs Snowball (smallest balance first) payoff strategies to save tens of thousands in interest and become debt-free years faster.",
    },
    {
      icon: "📄",
      title: "Zero-Debt PDF Legal Clearance Certificates",
      desc: "Generate official, verifiable Discharge Certificates with embedded Monad QR codes upon 100% repayment to present to banks, CIBIL, or legal entities.",
    },
    {
      icon: "📅",
      title: "Smart EMI Calendar & Automated Alerts",
      desc: "Never miss a due date. Multi-channel notifications via Email and SMS keep your repayment record 100% clean with zero late payment penalties.",
    },
    {
      icon: "🏦",
      title: "P2P Lending & Settlement Marketplace",
      desc: "Connect borrowers and verified lenders. Admin-guided partial waiver settlements help resolve defaulted loans with official discharge receipts.",
    },
    {
      icon: "📊",
      title: "CIBIL Score & 30-Day Risk Heatmap",
      desc: "Track credit score health in real-time and predict high-risk repayment delays 30 days before due dates using machine learning heuristics.",
    },
  ];

  const faqs = [
    {
      q: "What is DebtProof and why do I need it?",
      a: "DebtProof is a FinTech platform powered by Monad Blockchain that records immutable proof of every loan EMI repayment. Banks or lenders can sometimes lose payment records or miscredit EMIs. DebtProof ensures you always hold cryptographic proof of your payments.",
    },
    {
      q: "Is my personal financial data stored on the public blockchain?",
      a: "No! Only the SHA-256 cryptographic hash (digital fingerprint) of your receipt is anchored on Monad Blockchain. Your private documents and personal details stay encrypted and private in your secure vault.",
    },
    {
      q: "How does the AI Debt Destroyer Assistant work?",
      a: "Our AI assistant analyzes all your active loans, interest rates, and monthly budget to simulate Avalanche vs Snowball payoff strategies. It tells you exactly which loan to pay extra toward to save maximum money.",
    },
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes! You can switch between Free, Basic, Pro, Premium, and Enterprise plans instantly. Your active loan limits and feature permissions update immediately.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      <LandingNavbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/20 via-purple-600/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold backdrop-blur-xl animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monad Blockchain Testnet Active • 10,000 TPS Speed</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Never Lose Proof of Your <br />
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Loan Repayments
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            DebtProof is the world’s first FinTech platform combining <strong>Monad Blockchain Cryptographic Proofs</strong> with an <strong>AI Debt Destroyer Assistant</strong>. Lock in unalterable repayment records, simulate debt payoff strategies, and download official Zero-Debt Clearance Certificates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-rose-600/25 hover:scale-105 transition duration-200"
            >
              🚀 Get Started Free
            </Link>
            <Link
              href="#pricing"
              className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm hover:bg-slate-800 transition duration-200"
            >
              💎 View 5-Tier Plans
            </Link>
          </div>

          {/* Hero Live Platform Stats */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <p className="text-2xl font-black text-rose-400">₹14.2Cr+</p>
              <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Repayments Anchored</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Cryptographic Proof</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <p className="text-2xl font-black text-blue-400">10,000</p>
              <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Monad TPS Speed</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <p className="text-2xl font-black text-purple-400">0</p>
              <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Lost Receipts</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM & SOLUTION SHOWCASE ── */}
      <section className="py-20 px-4 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              ⚠️ THE PROBLEM WITH LOANS TODAY
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Banks Lose Receipts. <br />
              <span className="text-rose-400">Borrowers Suffer Penalties.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every year, thousands of borrowers face disputes over uncredited EMIs, missing bank receipts, or incorrect CIBIL default flags. Traditional paper receipts and bank emails can be lost or deleted.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❌</span> No central proof repository across multiple lenders
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❌</span> High compounding interest from delayed payoff strategies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❌</span> Difficulty proving 100% repayment when closing loans
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-6 shadow-2xl relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              🛡️ THE DEBTPROOF SOLUTION
            </div>
            <h3 className="text-xl font-black text-white">Immutable Monad Blockchain Vault</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              DebtProof computes a cryptographic SHA-256 fingerprint for every payment receipt and anchors it publicly on Monad Blockchain. It creates an unalterable paper trail that is 100% legally verifiable by anyone.
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400"><span>Monad Tx Hash:</span> <span className="text-emerald-400">Verified 0x71C7...976F</span></div>
              <div className="flex justify-between text-slate-400"><span>Security Seal:</span> <span className="text-purple-400">SHA-256 Encrypted</span></div>
              <div className="flex justify-between text-slate-400"><span>Verification:</span> <span className="text-blue-400">Monad Testnet (Chain ID 10143)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES SHOWCASE GRID ── */}
      <section className="py-24 px-4 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-rose-400">POWERFUL FINTECH & WEB3 FEATURES</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Everything You Need To Master Your Debt</h2>
          <p className="text-slate-400 text-sm">DebtProof comes packed with enterprise-grade debt management, AI strategy calculators, and blockchain security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresShowcase.map((f, i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition duration-200 space-y-3 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                {f.icon}
              </div>
              <h3 className="text-base font-black text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5-TIER DYNAMIC PRICING SECTION ── */}
      <section id="pricing" className="py-24 px-4 bg-slate-950/80 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">TRANSPARENT 5-TIER PRICING</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Choose The Plan That Fits Your Goals</h2>
            <p className="text-slate-400 text-sm">From free basic tracking to institutional multi-tenant SaaS features.</p>

            {/* Monthly / Yearly Toggle Switch */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-bold ${!isYearly ? "text-white" : "text-slate-400"}`}>Monthly Billing</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-7 rounded-full bg-slate-800 border border-slate-700 p-1 cursor-pointer transition"
              >
                <span className={`block w-5 h-5 rounded-full bg-rose-500 transition-transform ${isYearly ? "translate-x-7" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isYearly ? "text-white" : "text-slate-400"}`}>
                Yearly Billing
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black uppercase">
                  SAVE 20%
                </span>
              </span>
            </div>
          </div>

          {/* 5-Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {plans.map((p) => {
              const price = isYearly ? Math.round(p.priceYearly / 12) : p.priceMonthly;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-3xl flex flex-col justify-between space-y-6 transition duration-200 ${
                    p.popular
                      ? "bg-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-950/40 relative scale-105"
                      : "bg-slate-900/70 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${p.popular ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">{p.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                    </div>

                    <div className="py-2 border-y border-slate-800/80">
                      <p className="text-2xl font-black text-white">
                        ₹{price.toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.maxLoans}</p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 text-xs font-bold shrink-0">✓</span>
                          <span className="text-[11px]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={p.ctaHref}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider text-center transition cursor-pointer ${
                      p.popular
                        ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-rose-400"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {p.ctaText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="py-20 px-4 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="text-3xl font-black text-white">Have Questions? We Have Answers</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left text-sm font-bold text-white flex justify-between items-center cursor-pointer"
              >
                <span>{f.q}</span>
                <span className="text-slate-400 font-mono text-base">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto p-10 rounded-3xl bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Take Full Control Of Your Loan Repayments Today
          </h2>
          <p className="text-white/90 text-sm max-w-2xl mx-auto">
            Join thousands of smart borrowers anchoring their repayment receipts on Monad Blockchain and accelerating debt payoff with AI.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-slate-950 text-white font-black text-xs uppercase tracking-wider hover:bg-slate-900 transition shadow-xl inline-block"
            >
              🚀 Create Your Free Account Now
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
