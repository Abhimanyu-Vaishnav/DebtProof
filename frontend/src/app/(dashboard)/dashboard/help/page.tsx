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
    name: "My Loans & Repayment Manager",
    category: "core",
    role: "Manage all traditional bank loans (Home, Vehicle, Personal, Business, Credit Cards).",
    howToUse: [
      "Click '+ Add Loan' to record a new loan account with lender name, interest rate, EMI, and start/end dates.",
      "Use '📄 Parse CIBIL / Statement' to auto-extract loan data directly from uploaded PDF statements.",
      "Click any loan card to open its detailed page featuring radial repayment ring and monthly breakdown.",
      "Record EMI payments directly to maintain complete payment history."
    ],
    keyBenefits: ["CIBIL PDF auto-parser", "Foreclosure interest savings calculator", "Payment history logs"],
    path: "/dashboard/loans"
  },
  {
    id: "credit-cards",
    icon: "💳",
    name: "Credit Cards Command Center",
    category: "core",
    role: "Manage credit card accounts, statement balances, minimum due, and utilization ratios.",
    howToUse: [
      "Add your credit card details including credit limit and current balance.",
      "Monitor credit card utilization gauge (keep below 30% for optimal credit score).",
      "Record card bill payments to automatically update active balances."
    ],
    keyBenefits: ["Credit utilization monitoring", "Due date alerts", "Balance tracking"],
    path: "/dashboard/credit-cards"
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
    name: "Investments & Wealth Tracker",
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
      "Run Tax Savings Calculator to optimize Section 80C and Section 24(b) deductions."
    ],
    keyBenefits: ["Multi-metric chart overlays", "Tax savings calculator", "Interest cost analysis"],
    path: "/dashboard/analytics"
  },
  {
    id: "payments",
    icon: "💸",
    name: "Payments Log & History",
    category: "core",
    role: "Comprehensive log of all EMI payments with principal vs interest split.",
    howToUse: [
      "Click 'Record Payment' to log an EMI transaction.",
      "Attach receipt files or notes for every payment.",
      "Inspect monthly payment breakdowns and download individual vouchers."
    ],
    keyBenefits: ["Principal vs interest tracking", "Receipt attachment", "Filter by loan account"],
    path: "/dashboard/payments"
  },
  {
    id: "receipts",
    icon: "📁",
    name: "Receipt Vault & Monad Anchoring",
    category: "web3",
    role: "Store receipt documents and anchor SHA-256 document checksums to Monad Testnet.",
    howToUse: [
      "Upload receipt PDF/PNG images to the vault.",
      "Click 'Anchor to Monad Blockchain' to request Web3 wallet signature.",
      "Generate immutable proof link for bank or legal audits."
    ],
    keyBenefits: ["SHA-256 hashing", "On-chain Monad anchoring", "Tamper-proof storage"],
    path: "/dashboard/receipts"
  },
  {
    id: "calendar",
    icon: "📅",
    name: "Interactive EMI Calendar",
    category: "tools",
    role: "Monthly grid calendar highlighting EMI due dates and payment status.",
    howToUse: [
      "View green (Paid), yellow (Upcoming), and red (Overdue) dates.",
      "Click any date to record payment directly.",
      "Sync with Google/Apple calendar via iCal export."
    ],
    keyBenefits: ["Visual due date grid", "Direct payment recording", "Calendar sync"],
    path: "/dashboard/calendar"
  },
  {
    id: "repayment-simulator",
    icon: "🚀",
    name: "Repayment Simulator",
    category: "analytics",
    role: "Compare Avalanche vs Snowball payoff strategies with extra payment sliders.",
    howToUse: [
      "Adjust the extra monthly payment slider (₹1,000 – ₹50,000).",
      "Compare Debt Avalanche (highest rate first) vs Debt Snowball (smallest balance first).",
      "See exact months and interest saved."
    ],
    keyBenefits: ["Strategy comparison", "Extra payment calculator", "Debt freedom date prediction"],
    path: "/dashboard/repayment-simulator"
  },
  {
    id: "reports",
    icon: "📄",
    name: "Bank-Grade PDF Reports",
    category: "tools",
    role: "Generate official PDF statements and CSV/JSON data dumps for bank, tax, or legal use.",
    howToUse: [
      "Select report type: Loan Portfolio Statement, Payment History, or Net Worth Audit.",
      "Apply custom filters (specific loan, start date, end date).",
      "Click '📄 Export PDF' to trigger a print-ready formatted statement."
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
      "Connect MetaMask wallet on Monad Testnet.",
      "Borrowers post Web3 loan requests with principal, rate, and duration.",
      "Lenders fund requests directly with MON tokens via smart contract escrow."
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
    id: "assistant",
    icon: "🤖",
    name: "AI Strategy Assistant & Coach",
    category: "analytics",
    role: "Real-data AI assistant that answers financial queries using your actual database records.",
    howToUse: [
      "Open AI Assistant (`/dashboard/assistant`).",
      "Pick strategy prompts or type natural queries like 'Which loan should I close first?'.",
      "View exact calculations computed from your DB records."
    ],
    keyBenefits: ["Real-data DB engine", "Zero mock responses", "Instant FAQ resolution"],
    path: "/dashboard/assistant"
  },
  {
    id: "notifications",
    icon: "🔔",
    name: "Smart Notifications & Push",
    category: "tools",
    role: "Real-time alert system for upcoming EMIs, overdue warnings, and browser push alerts.",
    howToUse: [
      "Enable browser notifications for desktop alerts.",
      "Filter notifications by All, Unread, and EMI Alerts.",
      "Experience floating 3-day EMI due reminders."
    ],
    keyBenefits: ["Browser push notifications", "3-day EMI due floating popup", "Swipe gesture mobile controls"],
    path: "/dashboard/notifications"
  },
  {
    id: "net-worth",
    icon: "💎",
    name: "Net Worth & Liabilities Studio",
    category: "analytics",
    role: "Consolidated net worth audit (Total Assets minus Total Liabilities).",
    howToUse: [
      "View live Net Worth calculation.",
      "Inspect asset-to-debt ratio.",
      "Track net worth growth trends over time."
    ],
    keyBenefits: ["Consolidated asset/debt view", "Net worth trend chart", "Debt ratio indicator"],
    path: "/dashboard/net-worth"
  },
  {
    id: "zk-proofs",
    icon: "🛡️",
    name: "ZK-Credit Proof Studio",
    category: "web3",
    role: "Generate Zero-Knowledge credit proofs without exposing private income or bank statement details.",
    howToUse: [
      "Select credit threshold (e.g. Credit Score > 750).",
      "Generate cryptographic ZK proof string.",
      "Share proof link with lenders for private credit verification."
    ],
    keyBenefits: ["Complete financial privacy", "Verifiable credit proof", "No document leak risk"],
    path: "/dashboard/zk-proofs"
  },
  {
    id: "payoff-quest",
    icon: "🎯",
    name: "Debt Destroyer Payoff Quest",
    category: "tools",
    role: "Gamified debt reduction engine with XP points, streak counters, badges, and level unlocks.",
    howToUse: [
      "Complete debt payoff quests (e.g. Early EMI payment).",
      "Earn XP and build repayment streaks.",
      "Unlock custom dashboard badges and level titles."
    ],
    keyBenefits: ["Gamified motivation", "Repayment streaks", "Level achievements"],
    path: "/dashboard/payoff-quest"
  },
  {
    id: "refinance",
    icon: "🏦",
    name: "Refinance Savings Studio",
    category: "analytics",
    role: "Balance transfer calculator comparing your current loan rate with lower market offers.",
    howToUse: [
      "Select active loan to evaluate.",
      "Enter lower interest rate offered by rival banks.",
      "Calculate net interest savings after processing fees."
    ],
    keyBenefits: ["Balance transfer evaluator", "Net interest savings calculator", "Processing fee deduction"],
    path: "/dashboard/refinance"
  },
  {
    id: "auto-saver",
    icon: "⚡",
    name: "Auto-Saver Micro-Deposit Engine",
    category: "tools",
    role: "Round up daily transactions or set daily micro-deposits to auto-prepay high-interest debt.",
    howToUse: [
      "Enable spare change transaction roundups.",
      "Accumulate daily micro-deposits.",
      "Auto-apply monthly savings to loan principal."
    ],
    keyBenefits: ["Micro-saving automation", "Accelerated debt reduction", "Effortless savings"],
    path: "/dashboard/auto-saver"
  },
  {
    id: "organization",
    icon: "🏢",
    name: "Multi-Tenant Organization",
    category: "tools",
    role: "Multi-user tenancy management for households, joint families, small businesses, or team roles.",
    howToUse: [
      "Create or join an organization workspace.",
      "Assign member roles (Owner, Admin, Auditor).",
      "Share workspace financial records securely."
    ],
    keyBenefits: ["Household debt management", "Role-based security", "Shared workspaces"],
    path: "/dashboard/organization"
  },
  {
    id: "joint-workspace",
    icon: "👥",
    name: "Joint Workspace & Co-borrowers",
    category: "tools",
    role: "Shared financial space for co-borrowers to co-manage home loans or business credit.",
    howToUse: [
      "Invite co-borrowers via email.",
      "Co-manage active loan accounts.",
      "Track individual payment contributions."
    ],
    keyBenefits: ["Co-borrower tracking", "Shared payment logs", "Split contribution stats"],
    path: "/dashboard/joint-workspace"
  },
  {
    id: "activity",
    icon: "📊",
    name: "Activity Timeline & Audit",
    category: "tools",
    role: "Unified security login and operation event timeline.",
    howToUse: [
      "Review chronological user activity.",
      "Filter security and system audit events.",
      "Track AI assistant queries and loan modifications."
    ],
    keyBenefits: ["Complete audit trail", "IP logging", "Security tracking"],
    path: "/dashboard/activity"
  },
  {
    id: "statement-import",
    icon: "📄",
    name: "Statement Import Studio",
    category: "tools",
    role: "Batch upload CSV/Excel/PDF bank statements for automated transaction matching.",
    howToUse: [
      "Upload bank statement files.",
      "Map transaction column fields.",
      "Reconcile payments with active loans."
    ],
    keyBenefits: ["Batch file import", "Bank PDF support", "Automated reconciliation"],
    path: "/dashboard/statement-import"
  },
  {
    id: "settings",
    icon: "⚙️",
    name: "User Settings & Currency Switcher",
    category: "tools",
    role: "Preferences, base currency selector (INR ₹, USD $, EUR €, GBP £), and session controls.",
    howToUse: [
      "Switch preferred base currency.",
      "Toggle dark/light theme.",
      "Manage active security sessions."
    ],
    keyBenefits: ["Multi-currency support", "Theme preferences", "Session security"],
    path: "/dashboard/settings"
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
