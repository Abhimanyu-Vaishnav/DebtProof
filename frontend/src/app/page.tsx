"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { useTheme } from "@/contexts/ThemeContext";
import { subscriptionService, Plan } from "@/services/subscription.service";

/* ──────────────────────────────────────────────────────────
   DebtProof — World-Class Landing Page v3
   Design: Vercel + Linear + Apple — Minimal & Premium
   ────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [isYearly,  setIsYearly]  = useState(false);
  const [openFaq,   setOpenFaq]   = useState<number | null>(0);
  const [dbPlans,   setDbPlans]   = useState<Plan[]>([]);

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const dark = !isLight;

  useEffect(() => {
    subscriptionService.getSubscriptionOverview().then((res) => {
      if (res.plans && res.plans.length > 0) setDbPlans(res.plans);
    }).catch(() => {});
  }, []);

  const fallbackPlans = [
    {
      id: "free", code: "free", name: "Free", badge: "STARTER", popular: false,
      priceMonthly: 0, priceYearly: 0,
      description: "Basic loan tracking for individuals.",
      maxLoans: "Up to 3 loans",
      features: ["3 active loans", "EMI calendar", "Manual receipt upload", "Community support"],
      ctaText: "Get started free", ctaHref: "/register",
    },
    {
      id: "basic", code: "basic", name: "Basic", badge: "ESSENTIAL", popular: false,
      priceMonthly: 499, priceYearly: 4990,
      description: "Blockchain proof anchoring for serious borrowers.",
      maxLoans: "Up to 10 loans",
      features: ["10 active loans", "Monad SHA-256 anchoring", "Email & SMS alerts", "CSV report export"],
      ctaText: "Choose Basic", ctaHref: "/register?plan=basic",
    },
    {
      id: "premium", code: "premium", name: "Premium", badge: "MOST POPULAR", popular: true,
      priceMonthly: 999, priceYearly: 9990,
      description: "Full AI Debt Destroyer suite & clearance certificates.",
      maxLoans: "Unlimited loans",
      features: ["Unlimited loans", "AI Debt Destroyer", "Snowball vs Avalanche", "Refinance Studio", "ZK Credit Proofs", "Priority support"],
      ctaText: "Start Premium", ctaHref: "/register?plan=premium",
    },
    {
      id: "business", code: "business", name: "Business", badge: "ADVANCED", popular: false,
      priceMonthly: 2499, priceYearly: 24990,
      description: "Credit score tracking & predictive risk heatmaps.",
      maxLoans: "Unlimited loans",
      features: ["Unlimited loans", "CIBIL score tracking", "30-day risk heatmap", "Monad Escrow Vault", "Dedicated advisor"],
      ctaText: "Get Business", ctaHref: "/register?plan=business",
    },
    {
      id: "enterprise", code: "enterprise", name: "Enterprise", badge: "INSTITUTIONAL", popular: false,
      priceMonthly: 4999, priceYearly: 49990,
      description: "Whitelabel, multi-tenant RBAC & bureau exports.",
      maxLoans: "Unlimited Enterprise",
      features: ["Whitelabel custom domain", "Multi-tenant RBAC", "Quarterly bureau export", "Dedicated API & SLA", "1-click cache studio"],
      ctaText: "Contact Sales", ctaHref: "/register?plan=enterprise",
    },
  ];

  const displayPlans = dbPlans.length > 0
    ? dbPlans.map((p) => ({
        id: p.id || p.code,
        code: p.code,
        name: p.name,
        badge: p.is_popular ? "MOST POPULAR" : p.code.toUpperCase(),
        priceMonthly: Number(p.price_monthly),
        priceYearly: Number(p.price_yearly || Number(p.price_monthly) * 10),
        description: `${p.name} subscription tier.`,
        maxLoans: p.max_loans === -1 ? "Unlimited loans" : `Up to ${p.max_loans} loans`,
        features: [
          p.max_loans === -1 ? "Unlimited active loans" : `Up to ${p.max_loans} loans`,
          `${p.max_ai_requests === -1 ? "Unlimited" : p.max_ai_requests} AI requests/mo`,
          `${p.max_blockchain_proofs === -1 ? "Unlimited" : p.max_blockchain_proofs} Monad proofs/mo`,
          p.features_json.includes("refinance_studio") ? "Refinance Savings Studio" : "Basic EMI Calculator",
          p.features_json.includes("auto_saver") ? "Micro Auto-Saver Vault" : "Standard payments",
          p.features_json.includes("zk_proofs") ? "Zero-Knowledge Credit Proofs" : "Basic PDF proofs",
        ],
        ctaText: p.code === "free" ? "Get started free" : `Choose ${p.name}`,
        ctaHref: `/register?plan=${p.code}`,
        popular: p.is_popular || p.is_recommended,
      }))
    : fallbackPlans;

  const features = [
    { icon: "🛡️", title: "Monad Blockchain Proofs", desc: "Every EMI receipt is SHA-256 hashed and anchored on Monad (10k TPS). Immutable, tamper-proof, legally indisputable." },
    { icon: "🤖", title: "AI Debt Destroyer", desc: "Avalanche vs Snowball simulation that shows you the exact optimal repayment sequence to save maximum interest." },
    { icon: "📄", title: "Clearance Certificates", desc: "Generate official zero-debt PDF certificates with embedded Monad QR codes. Accepted by banks and CIBIL." },
    { icon: "📅", title: "Smart EMI Calendar", desc: "Multi-channel alerts via Email and SMS. Never miss a due date or incur a late payment penalty again." },
    { icon: "🏦", title: "P2P Settlement Market", desc: "Connect borrowers & lenders. Admin-guided partial waiver settlements with official discharge receipts." },
    { icon: "📊", title: "CIBIL Risk Heatmap", desc: "Real-time credit health tracking and 30-day predictive default risk modeling with ML heuristics." },
  ];

  const faqs = [
    {
      q: "What is DebtProof and why do I need it?",
      a: "DebtProof records immutable proof of every loan EMI repayment on Monad Blockchain. Banks can lose records or miscredit EMIs — DebtProof ensures you always hold cryptographic proof that is legally undefeatable.",
    },
    {
      q: "Is my personal data stored on the public blockchain?",
      a: "No. Only the SHA-256 cryptographic hash (digital fingerprint) of your receipt is anchored publicly. Your documents and personal details stay encrypted and private in your secure vault.",
    },
    {
      q: "How does the AI Debt Destroyer work?",
      a: "Our AI analyzes all your loans, rates, and budget to simulate Avalanche vs Snowball strategies. It tells you exactly which loan to pay extra toward to save the most money and become debt-free fastest.",
    },
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes! You can switch plans instantly. Loan limits and feature permissions update immediately. No lock-ins, ever.",
    },
  ];

  const bg       = isLight ? "bg-white" : "bg-[#0c0f1a]";
  const textBase = isLight ? "text-slate-900" : "text-white";
  const textMuted = isLight ? "text-slate-500" : "text-slate-400";
  const borderColor = isLight ? "border-slate-200" : "border-white/7";
  const cardBg  = isLight ? "bg-white border-slate-200 shadow-sm shadow-slate-100" : "bg-[#111827] border-white/7";
  const sectionBg = isLight ? "bg-slate-50 border-slate-200" : "bg-[#111827]/60 border-white/5";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${bg} ${textBase} selection:bg-indigo-500 selection:text-white`}>
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-5 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/12 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Live badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold border ${
            isLight ? "bg-white border-slate-200 text-slate-700 shadow-sm" : "bg-white/5 border-white/10 text-slate-300"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Monad Blockchain Testnet Active · 10,000 TPS
          </div>

          {/* Headline */}
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] ${textBase}`}>
            Never lose proof of
            <br />
            <span className="gradient-text-brand">your loan repayments.</span>
          </h1>

          {/* Subheadline */}
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${textMuted}`}>
            DebtProof combines <strong className={textBase}>Monad Blockchain cryptographic proofs</strong> with an{" "}
            <strong className={textBase}>AI Debt Destroyer assistant</strong> to protect, track, and accelerate your path to zero debt.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[14px] shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get started free →
            </Link>
            <Link
              href="#pricing"
              className={`px-7 py-3.5 rounded-xl border font-semibold text-[14px] transition-all duration-200 ${
                isLight ? "bg-white border-slate-200 text-slate-800 hover:border-slate-300" : "bg-white/5 border-white/10 text-white hover:bg-white/8"
              }`}
            >
              View plans
            </Link>
          </div>

          {/* Stats Row */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "₹14.2Cr+", label: "Repayments Anchored", color: "text-indigo-400" },
              { value: "100%",     label: "Cryptographic Proof",  color: "text-emerald-400" },
              { value: "10,000",   label: "Monad TPS Speed",      color: "text-blue-400" },
              { value: "0",        label: "Lost Receipts",         color: "text-purple-400" },
            ].map((stat) => (
              <div key={stat.label} className={`p-5 rounded-2xl border ${cardBg}`}>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${textMuted}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className={`py-24 px-5 border-y ${sectionBg}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
              ⚠️ The problem today
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black leading-tight ${textBase}`}>
              Banks lose receipts.
              <br />
              <span className="text-rose-500">Borrowers pay penalties.</span>
            </h2>
            <p className={`text-[14px] leading-relaxed ${textMuted}`}>
              Every year, thousands face disputes over uncredited EMIs, missing bank receipts, or incorrect CIBIL default flags. Paper receipts and emails can be lost, edited, or deleted.
            </p>
            <ul className={`space-y-3 text-[13px] font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              {[
                "No central proof repository across multiple lenders",
                "High compounding interest from delayed payoff strategies",
                "Difficulty proving 100% repayment when closing loans",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-500/12 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Card */}
          <div id="security" className={`p-8 rounded-3xl border space-y-6 ${isLight ? "bg-white border-slate-200 shadow-xl shadow-slate-100" : "bg-gradient-to-br from-[#111827] to-[#0c0f1a] border-white/7"}`}>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              🛡️ The DebtProof solution
            </div>
            <h3 className={`text-xl font-bold ${textBase}`}>Immutable Monad Blockchain Vault</h3>
            <p className={`text-[13px] leading-relaxed ${textMuted}`}>
              DebtProof computes a SHA-256 fingerprint for every payment receipt and anchors it on Monad Blockchain — creating an unalterable paper trail that is 100% legally verifiable by anyone.
            </p>
            <div className={`p-4 rounded-2xl border space-y-2 font-mono text-[11px] ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#0c0f1a] border-white/5"}`}>
              <div className={`flex justify-between ${textMuted}`}>
                <span>Monad Tx Hash:</span>
                <span className="text-emerald-400 font-bold">Verified 0x71C7...976F</span>
              </div>
              <div className={`flex justify-between ${textMuted}`}>
                <span>Security Seal:</span>
                <span className="text-purple-400 font-bold">SHA-256 Encrypted</span>
              </div>
              <div className={`flex justify-between ${textMuted}`}>
                <span>Verification:</span>
                <span className="text-blue-400 font-bold">Monad Testnet (Chain 10143)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className={`text-[11px] font-black uppercase tracking-widest ${isLight ? "text-indigo-600" : "text-indigo-400"}`}>
            Powerful FinTech & Web3 Features
          </span>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${textBase}`}>
            Everything to master your debt
          </h2>
          <p className={`text-[14px] ${textMuted}`}>
            Enterprise-grade debt management, AI strategy calculators, and blockchain security — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border transition-all duration-200 group hover:-translate-y-1 hover:border-indigo-500/30 ${cardBg}`}
            >
              <div className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${
                isLight ? "bg-slate-100" : "bg-white/5"
              }`}>
                {f.icon}
              </div>
              <h3 className={`text-[14px] font-bold mb-2 ${textBase}`}>{f.title}</h3>
              <p className={`text-[12px] leading-relaxed ${textMuted}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className={`py-24 px-5 border-y ${sectionBg}`}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-5 max-w-2xl mx-auto">
            <span className={`text-[11px] font-black uppercase tracking-widest ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
              Transparent 5-Tier Pricing
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black ${textBase}`}>Choose the plan that fits your goals</h2>
            <p className={`text-[14px] ${textMuted}`}>From free tracking to institutional multi-tenant SaaS.</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`text-[13px] font-semibold ${!isYearly ? textBase : textMuted}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-11 h-6 rounded-full border p-0.5 cursor-pointer transition ${
                  isLight ? "bg-slate-200 border-slate-300" : "bg-white/10 border-white/10"
                }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-indigo-500 shadow-md transition-transform ${isYearly ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className={`text-[13px] font-semibold flex items-center gap-2 ${isYearly ? textBase : textMuted}`}>
                Yearly
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-black uppercase">SAVE 20%</span>
              </span>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {displayPlans.map((p) => {
              const price = isYearly ? Math.round(p.priceYearly / 12) : p.priceMonthly;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                    p.popular
                      ? `relative ${isLight ? "bg-white" : "bg-[#111827]"} border-2 border-indigo-500 shadow-2xl shadow-indigo-500/15 scale-105`
                      : `${cardBg} border`
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wide">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-5">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        p.popular
                          ? "bg-indigo-500/15 text-indigo-400"
                          : isLight ? "bg-slate-100 text-slate-500" : "bg-white/8 text-slate-500"
                      }`}>
                        {p.badge}
                      </span>
                      <h3 className={`text-[16px] font-black mt-3 ${textBase}`}>{p.name}</h3>
                      <p className={`text-[11px] mt-1 min-h-[32px] ${textMuted}`}>{p.description}</p>
                    </div>

                    <div className={`py-3 border-y ${borderColor}`}>
                      <p className={`text-2xl font-black ${textBase}`}>
                        ₹{price.toLocaleString()}
                        <span className={`text-[11px] font-normal ${textMuted}`}>/mo</span>
                      </p>
                      <p className={`text-[10px] font-mono mt-0.5 ${textMuted}`}>{p.maxLoans}</p>
                    </div>

                    <ul className="space-y-2">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          <span className={`text-[11px] ${isLight ? "text-slate-700" : "text-slate-300"}`}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      onClick={() => {
                        const tagMap: Record<string, string> = { free: "Free", basic: "Basic", pro: "Pro", premium: "Premium", business: "Business", enterprise: "Enterprise" };
                        const targetTag = tagMap[p.code] || "Pro";
                        import("@/services/plan.service").then((mod) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          mod.setUserPlan(targetTag as any);
                          window.location.href = "/dashboard";
                        });
                      }}
                      className={`w-full py-2.5 rounded-xl text-[12px] font-bold text-center transition cursor-pointer ${
                        p.popular
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                          : isLight
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                            : "bg-white/8 hover:bg-white/12 text-white border border-white/10"
                      }`}
                    >
                      {p.ctaText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-5">
            <div className="text-center">
              <h3 className={`text-lg font-bold ${textBase}`}>Complete feature comparison</h3>
              <p className={`text-[12px] mt-1 ${textMuted}`}>See every capability included in each plan tier</p>
            </div>

            <div className={`rounded-2xl border overflow-x-auto ${isLight ? "bg-white border-slate-200 shadow-lg shadow-slate-100" : "bg-[#111827] border-white/7"}`}>
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className={`border-b font-semibold ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/3 border-white/7 text-slate-300"}`}>
                    <th className="p-4">Feature</th>
                    {["Free (₹0)", "Basic (₹499)", "Premium (₹999) ⭐", "Business (₹2,499)", "Enterprise (₹4,999)"].map((h) => (
                      <th key={h} className="p-4 text-center whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100 text-slate-600" : "divide-white/5 text-slate-400"}`}>
                  {[
                    { label: "Active Loan Limit", cells: ["3 loans", "10 loans", "Unlimited ✓", "Unlimited ✓", "Unlimited ✓"], highlight: [2,3,4] },
                    { label: "EMI Calendar & Reminders", cells: ["✓", "✓", "✓", "✓", "✓"], highlight: [0,1,2,3,4] },
                    { label: "Monad Blockchain SHA-256 Proofs", cells: ["—", "✓", "✓", "✓", "✓"], highlight: [1,2,3,4] },
                    { label: "AI Debt Destroyer Assistant", cells: ["—", "—", "✓", "✓", "✓"], highlight: [2,3,4] },
                    { label: "Snowball vs Avalanche Simulator", cells: ["—", "—", "✓", "✓", "✓"], highlight: [2,3,4] },
                    { label: "Zero-Debt PDF Clearance Certificates", cells: ["—", "—", "✓", "✓", "✓"], highlight: [2,3,4] },
                    { label: "P2P Settlement & Waiver Desk", cells: ["—", "—", "✓", "✓", "✓"], highlight: [2,3,4] },
                    { label: "CIBIL Score & 30-Day Risk Heatmap", cells: ["—", "—", "—", "✓", "✓"], highlight: [3,4] },
                    { label: "Web3 Monad Escrow Vault", cells: ["—", "—", "—", "✓", "✓"], highlight: [3,4] },
                    { label: "Whitelabel RBAC & Bureau Exports", cells: ["—", "—", "—", "—", "✓"], highlight: [4] },
                  ].map((row) => (
                    <tr key={row.label} className={`hover:${isLight ? "bg-slate-50" : "bg-white/3"} transition`}>
                      <td className={`p-4 font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{row.label}</td>
                      {row.cells.map((cell, i) => (
                        <td key={i} className={`p-4 text-center font-semibold ${row.highlight.includes(i) ? "text-emerald-500" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-24 px-5 max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className={`text-[11px] font-black uppercase tracking-widest ${isLight ? "text-purple-600" : "text-purple-400"}`}>FAQ</span>
          <h2 className={`text-3xl font-black ${textBase}`}>Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full px-5 py-4 text-left text-[13px] font-semibold flex justify-between items-center cursor-pointer hover:${
                  isLight ? "bg-slate-50" : "bg-white/3"
                } transition ${textBase}`}
              >
                <span>{f.q}</span>
                <span className={`text-lg font-light ${textMuted} transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className={`px-5 pb-5 text-[12px] leading-relaxed border-t pt-4 ${borderColor} ${textMuted} animate-fade-in`}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-center space-y-6 overflow-hidden shadow-2xl shadow-indigo-600/30">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/8 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/15 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Take full control of your
                <br />loan repayments today.
              </h2>
              <p className="text-white/80 text-[14px] max-w-xl mx-auto">
                Join thousands of smart borrowers anchoring repayment receipts on Monad Blockchain and accelerating debt payoff with AI.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-[14px] hover:bg-slate-100 transition shadow-lg"
              >
                Create your free account →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
