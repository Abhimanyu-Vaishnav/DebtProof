"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";

interface FeatureGuide {
  id: string;
  icon: string;
  name: string;
  category: "core" | "analytics" | "web3" | "tools";
  role: string;
  howToUse: string[];
  keyBenefits: string[];
  path: string;
}

const FEATURE_GUIDES: FeatureGuide[] = [
  {
    id: "overview",
    icon: "📊",
    name: "Dashboard & Overview",
    category: "core",
    role: "Central command center for real-time tracking of active loans, monthly interest burn, total outstanding debt, and recent payments.",
    howToUse: [
      "Open Dashboard to review top KPI cards (Total Borrowed, Total Repaid, Outstanding, Monthly EMI).",
      "Monitor individual loan progress bars with color-coded status.",
      "Check the Monthly Payment History interactive bar/line chart.",
      "Track your active Income Streams and see if your total EMI stays within safe limits (<35%)."
    ],
    keyBenefits: ["Instant financial health overview", "Live EMI alerts", "Safe debt ratio indicator"],
    path: "/dashboard"
  },
  {
    id: "loans",
    icon: "🏦",
    name: "My Loans",
    category: "core",
    role: "Manage all traditional bank loans (Home, Vehicle, Personal, Business, Credit Cards).",
    howToUse: [
      "Click '+ Add Loan' to record a new loan account with lender name, interest rate, EMI, and start/end dates.",
      "Click any loan card to open its detailed page featuring radial repayment ring and monthly breakdown.",
      "Use '⚡ Foreclose / Part-Pay' calculator to see how prepayments reduce total interest.",
      "Record EMI payments directly to maintain complete payment history."
    ],
    keyBenefits: ["Detailed progress visualization", "Foreclosure interest savings calculator", "Payment history logs"],
    path: "/dashboard/loans"
  },
  {
    id: "budget",
    icon: "💵",
    name: "Budget Planner",
    category: "core",
    role: "Unified monthly budgeting engine that synchronizes your income streams, living expenses, and EMI commitments.",
    howToUse: [
      "Add or edit income sources in the 'Income' tab (synchronizes live with Dashboard).",
      "Set your category-wise monthly living expenses (Rent, Food, Utilities, Transport, etc.).",
      "Review the Budget Health Score (0-100) and Cash Flow Allocation breakdown.",
      "Click '💾 Save Plan' to persist your monthly budget plan."
    ],
    keyBenefits: ["Automated DTI calculation", "Live 2-way income sync with Dashboard", "Personalized budget recommendations"],
    path: "/dashboard/budget"
  },
  {
    id: "investments",
    icon: "📈",
    name: "Investments & SIPs",
    category: "analytics",
    role: "Track your wealth-building assets (Mutual Funds, Stocks, FDs, Crypto, Real Estate, Gold).",
    howToUse: [
      "Add investment items with initial capital, current valuation, and expected return (CAGR %).",
      "Click any investment item to view its interactive Growth Chart (Invested vs Current Valuation).",
      "Utilize the Future Compound Wealth Predictor to project returns over 1, 3, 5, and 10 years."
    ],
    keyBenefits: ["Growth chart visualization", "Compound interest calculator", "Portfolio allocation mix"],
    path: "/dashboard/investments"
  },
  {
    id: "analytics",
    icon: "⚡",
    name: "Analytics & Chart Studio",
    category: "analytics",
    role: "Advanced financial intelligence suite for deep-dive metric overlays and strategy comparison.",
    howToUse: [
      "Use 'Interactive Chart Studio' to toggle/overlay Payments, Net Worth, Investments, and Debt curves.",
      "Analyze Monthly Interest Burn (money lost to interest vs principal).",
      "Run Debt Battle Simulator to compare Snowball vs Avalanche payoff strategies.",
      "Use Tax Savings Calculator for home loan deduction optimization."
    ],
    keyBenefits: ["Multi-metric chart overlays", "Snowball vs Avalanche strategy simulator", "Interest cost analysis"],
    path: "/dashboard/analytics"
  },
  {
    id: "reports",
    icon: "📄",
    name: "Reports & PDF Export",
    category: "tools",
    role: "Generate official PDF statements and CSV/JSON data dumps for bank, tax, or legal use.",
    howToUse: [
      "Select desired report type: Loan Portfolio Statement, Payment History, Net Worth, or Credit Cards.",
      "Apply custom filters (specific loan, start date, end date).",
      "Click '📄 Export PDF' to trigger a print-ready formatted statement, or '📊 CSV / JSON' for data export."
    ],
    keyBenefits: ["One-click PDF print statements", "Filtered CSV export", "Audit-ready financial logs"],
    path: "/dashboard/reports"
  },
  {
    id: "p2p",
    icon: "🤝",
    name: "P2P Web3 Market & Escrow",
    category: "web3",
    role: "Decentralized peer-to-peer lending powered by Monad Blockchain smart contracts.",
    howToUse: [
      "Borrowers create Web3 loan requests with principal amount, interest rate, and duration.",
      "Lenders fund loans using MON tokens directly via Web3 wallet (MetaMask).",
      "Escrow smart contract manages automated disbursement and on-chain repayment verification."
    ],
    keyBenefits: ["Zero middleman fees", "Transparent smart contract escrow", "On-chain reputation tracking"],
    path: "/dashboard/p2p-market"
  },
  {
    id: "verify",
    icon: "🛡️",
    name: "Verify Cryptographic Proof",
    category: "web3",
    role: "Verify receipt authenticity using SHA-256 cryptographic hashes anchored on Monad Testnet.",
    howToUse: [
      "Upload any receipt document file or enter receipt hash.",
      "System computes the cryptographic hash and queries Monad Blockchain.",
      "Displays verification badge, transaction hash, block number, and timestamp."
    ],
    keyBenefits: ["Tamper-proof repayment evidence", "Bank & legal admissibility", "Public blockchain verification"],
    path: "/verify-proof"
  },
  {
    id: "notifications",
    icon: "🔔",
    name: "Smart Notifications & Push",
    category: "tools",
    role: "Real-time alert system for upcoming EMIs, overdue warnings, and browser push alerts.",
    howToUse: [
      "Click 'Enable' on Browser Push banner to get alerts directly on your device.",
      "Filter notifications by All, Unread, EMI Alerts, and Payments.",
      "Swipe right to mark read, swipe left to delete."
    ],
    keyBenefits: ["Browser push notifications", "3-day EMI due floating popup", "Swipe gesture mobile controls"],
    path: "/dashboard/notifications"
  }
];

export default function HelpAboutPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = FEATURE_GUIDES.filter(g => {
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Topbar title="Help Center & Feature Guide" subtitle="Comprehensive guide on how to use every feature in DebtProof" />
      <main className="page-content space-y-8 pb-16">

        {/* Hero Welcome Banner */}
        <div className="card p-6 border-2 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-secondary)] relative overflow-hidden">
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-light)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full">
              DebtProof User Guide
            </span>
            <h1 className="text-2xl font-black text-[var(--color-text-primary)]">
              Master Every Feature of DebtProof
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              DebtProof combines traditional financial management with Monad Blockchain security. Use this guide to understand every module, its role, and step-by-step instructions.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
            {[
              { id: "all", label: "All Features", icon: "🌐" },
              { id: "core", label: "Core Modules", icon: "🏦" },
              { id: "analytics", label: "Analytics & Wealth", icon: "📊" },
              { id: "web3", label: "Web3 & Blockchain", icon: "⛓️" },
              { id: "tools", label: "Reports & Tools", icon: "🛠️" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[var(--color-primary)] text-white shadow-md"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search any feature or guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Feature Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between space-y-4 hover:border-[var(--color-primary-light)] transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">
                      {guide.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[var(--color-text-primary)]">{guide.name}</h3>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-primary-light)]">
                        {guide.category} module
                      </span>
                    </div>
                  </div>
                  <Link
                    href={guide.path}
                    className="btn btn-secondary btn-xs font-bold text-[11px] px-3 py-1 flex items-center gap-1"
                  >
                    Open Page →
                  </Link>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">🎯 Role & Purpose</p>
                  <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">{guide.role}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">📖 How To Use</p>
                  <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] font-medium">
                    {guide.howToUse.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--color-primary-light)] font-bold shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border-light)] flex flex-wrap gap-1.5">
                {guide.keyBenefits.map(b => (
                  <span key={b} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Future Expansion & Extensibility Note */}
        <div className="card p-6 border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">Future-Proof Architecture & Extensibility</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            DebtProof is engineered with a modular service-oriented architecture. When new features or financial tools are added to the application, corresponding downloadable reports, PDF templates, and analytical guides are automatically integrated into the <strong>Reports Client</strong> and <strong>Help Center</strong>.
          </p>
        </div>

      </main>
    </>
  );
}
