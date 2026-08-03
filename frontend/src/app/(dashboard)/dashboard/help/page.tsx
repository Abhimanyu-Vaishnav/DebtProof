/**
 * DebtProof — Help, Feature Guide & Customer Support Hub with Multi-Tier Ticket Chat
 * Features direct user ticket submission, live chat, multi-tier escalation tracking, complete feature manuals, and FAQs.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { supportService, type SupportTicketItem, type TicketMessageItem } from "@/services/support.service";
import { COMPREHENSIVE_50_FAQS, searchFAQS, type FAQItem } from "@/services/faqData";
import { useToast } from "@/components/ui/Toast";
import { 
  Headphones, 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Plus, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  LifeBuoy,
  FileText,
  HelpCircle,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Search,
  Zap,
  Info,
  ShieldCheck
} from "lucide-react";

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
    name: "Dashboard & Overview Command Center",
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
    id: "ai-assistant",
    icon: "🤖",
    name: "AI Financial Strategy Coach & Assistant",
    category: "core",
    role: "Unified AI Financial Assistant that analyzes full portfolio data and responds in Hindi and English with actionable debt reduction advice.",
    howToUse: [
      "Ask questions in natural Hindi or English e.g. 'Mera kaunsa loan sabse pehle khatam karein?'",
      "Use floating AI Coach widget or full studio page (/dashboard/assistant) with seamless real-time chat sync.",
      "Use Voice Studio mic button for hands-free financial strategy conversation.",
      "Get contextual guidance based on your currently active page and loan schedule."
    ],
    keyBenefits: ["Bilingual NLU engine (Hindi/English)", "Cross-page synced chat", "Portfolio deep analytics"],
    path: "/dashboard/assistant"
  },
  {
    id: "loans",
    icon: "🏦",
    name: "My Loans & Interactive Schedule Manager",
    category: "core",
    role: "Manage all traditional bank loans (Home, Vehicle, Personal, Business, Credit Cards) with step-by-step past EMI setup and foreclosure execution.",
    howToUse: [
      "Click '+ Add Loan' and select past paid EMIs in Step 2 to accurately auto-compute remaining balance.",
      "Use '📄 Parse CIBIL / Statement' to auto-extract loan data directly from uploaded PDF statements.",
      "Click any loan card to open its detailed page featuring radial repayment ring and monthly breakdown.",
      "Execute part-prepayment or full foreclosure directly with instant schedule re-calculation."
    ],
    keyBenefits: ["CIBIL PDF auto-parser", "Foreclosure interest savings calculator", "Interactive EMI setup"],
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
    name: "Budget Planner Engine",
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
    name: "Investments & Compound Wealth Predictor",
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
    id: "receipts",
    icon: "📁",
    name: "Receipt Vault & Monad Blockchain Anchoring",
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
    id: "repayment-simulator",
    icon: "🚀",
    name: "Repayment Simulator (Snowball vs Avalanche)",
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
    name: "Bank-Grade PDF Reports & Certificates",
    category: "tools",
    role: "Generate official PDF statements, zero-debt clearance certificates, and audit logs.",
    howToUse: [
      "Select report type: Loan Portfolio Statement, Payment History, or Zero Debt Clearance Certificate.",
      "Apply custom filters (specific loan, start date, end date).",
      "Click '📄 Export PDF' to trigger a print-ready formatted statement."
    ],
    keyBenefits: ["One-click PDF print statements", "Zero debt certificates", "Audit-ready financial logs"],
    path: "/dashboard/reports"
  },
];

const FAQS = [
  {
    q: "How does the Multi-Tier Customer Support system work?",
    a: "When you submit a support ticket, it is assigned to Level-1 Customer Support. If your problem requires backend account data adjustment or interest recalculation, the agent escalates your ticket to an Admin Manager or SuperAdmin. You can track live status and chat directly inside your ticket dashboard."
  },
  {
    q: "Does the AI Coach speak and understand Hindi?",
    a: "Yes! DebtProof AI is powered by a bilingual NLU engine. If you type or speak in Hindi/Hinglish, it will reply in Hindi. If you ask in English, it responds in English while analyzing your complete active loan portfolio."
  },
  {
    q: "How do I foreclosure a loan and verify 100% Repaid status?",
    a: "Go to My Loans -> Click your loan card -> Click '⚡ Foreclose Loan'. Enter your foreclosure payment amount. The system automatically recalculates the schedule, logs confirmed payment, and turns the repayment ring to 100% green."
  },
  {
    q: "What is Monad Blockchain Anchoring?",
    a: "Monad Blockchain Anchoring takes the cryptographic SHA-256 hash of your payment receipts and posts it to the Monad Testnet blockchain. This gives you legally verifiable, tamper-proof proof of payment that banks or lenders cannot dispute."
  },
  {
    q: "Is my personal financial data secure?",
    a: "Yes. All data is encrypted in transit and at rest using bank-grade AES-256 encryption and tenant-isolated database architecture."
  }
];

export default function SupportHelpPage() {
  const [activeTab, setActiveTab] = useState<"about_guides" | "tickets" | "new_ticket" | "faq">("about_guides");
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);

  // Live Chat Reply State
  const [replyText, setReplyText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const { showToast } = useToast();

  const loadTickets = async () => {
    const list = await supportService.getTickets();
    setTickets(list);
    if (!selectedTicket && list.length > 0) {
      setSelectedTicket(list[0]);
    } else if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const created = await supportService.createTicket({ subject, message, priority });
      showToast("Support ticket created successfully! Representative assigned.", "success");
      setSubject("");
      setMessage("");
      setActiveTab("tickets");
      await loadTickets();
      setSelectedTicket(created);
    } catch {
      showToast("Failed to create ticket. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket || chatLoading) return;

    setChatLoading(true);
    try {
      await supportService.sendTicketMessage(selectedTicket.id, replyText, "user", "You (Client)");
      setReplyText("");
      showToast("Message sent to support team.", "success");
      await loadTickets();
    } catch {
      showToast("Failed to send message.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const filteredGuides = FEATURE_GUIDES.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Topbar title="Help, App Guide & Customer Support Hub" subtitle="Complete App Manual, Feature Guides, FAQs & Multi-Tier Customer Support" />

      <main className="page-content space-y-6 pb-16 font-sans">
        {/* Support Hero Header */}
        <div className="card bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Complete App Documentation & 24/7 Support
                </span>
                <span className="text-xs text-slate-400 font-mono">Support Level: Support → Manager → Admin</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black">Help, About App Features & Support Hub</h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                Learn how to use every DebtProof feature, optimize your loan payoffs, or contact our multi-tier customer support team directly with live ticket chat!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("new_ticket")}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Support Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("about_guides")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "about_guides"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> About App Features & Manual ({FEATURE_GUIDES.length})
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "tickets"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> My Active Support Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab("new_ticket")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "new_ticket"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" /> File Support Ticket
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === "faq"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions (FAQs)
          </button>
        </div>

        {/* TAB 1: ABOUT APP FEATURES & MANUAL GUIDE */}
        {activeTab === "about_guides" && (
          <div className="space-y-6">
            {/* Search Filter Box */}
            <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
              <div className="flex-1 flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  placeholder="Search app features (e.g. AI Coach, Foreclosure, CIBIL, Monad)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">{filteredGuides.length} Modules Available</span>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">{guide.icon}</span>
                        <div>
                          <h3 className="text-base font-black text-white">{guide.name}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                            {guide.category} module
                          </span>
                        </div>
                      </div>

                      <Link
                        href={guide.path}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white font-extrabold text-[11px] transition flex items-center gap-1 shrink-0"
                      >
                        <span>Open Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">🎯 Role & Purpose</p>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{guide.role}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">📖 How To Use / Step-By-Step</p>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {guide.howToUse.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {guide.keyBenefits.map((b) => (
                      <span key={b} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE TICKETS & LIVE CHAT INTERFACE */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets Sidebar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-purple-400" /> Your Support Tickets
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">{tickets.length} Records</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {tickets.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-xs text-slate-500">No active support tickets found.</p>
                    <button
                      onClick={() => setActiveTab("new_ticket")}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                    >
                      Create First Ticket
                    </button>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                        selectedTicket?.id === t.id
                          ? "bg-purple-950/40 border-purple-500/40 text-white shadow-lg"
                          : "bg-slate-950 border-slate-800 hover:bg-slate-800/50 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-400 font-bold">#{t.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            t.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : t.status === "escalated"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold truncate text-slate-100">{t.subject}</h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                        <span>Assigned: <strong>{t.tier_level}</strong></span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ticket Chat & Escalation Status Details */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[600px]">
              {selectedTicket ? (
                <>
                  {/* Ticket Header & Multi-Tier Badge */}
                  <div className="pb-4 border-b border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-purple-400">
                          #{selectedTicket.id}
                        </span>
                        <h2 className="text-base font-black text-white">{selectedTicket.subject}</h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedTicket.status === "resolved" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const reason = prompt("Enter reason for reopening ticket:");
                                if (reason) {
                                  supportService.reopenTicket(selectedTicket.id, reason);
                                  showToast("Ticket reopened!", "info");
                                  loadTickets();
                                }
                              }}
                              className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition cursor-pointer"
                            >
                              🔄 Reopen Ticket
                            </button>
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ Resolved
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const notes = prompt("Enter resolution notes:");
                                if (notes) {
                                  supportService.resolveTicket(selectedTicket.id, notes, "customer_support", "Client Verified Resolution");
                                  showToast("Ticket marked as resolved!", "success");
                                  loadTickets();
                                }
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                            >
                              ✓ Mark as Resolved
                            </button>
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Tier: {selectedTicket.tier_level}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Star Rating Widget for Resolved Tickets */}
                    {selectedTicket.status === "resolved" && (
                      <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">Rate Customer Support Representative:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => {
                                  const feedback = prompt("Optional feedback for representative:");
                                  supportService.rateTicketExperience(selectedTicket.id, star, feedback || "Great support experience!");
                                  showToast(`Thank you! Submitted ${star} Star rating.`, "success");
                                  loadTickets();
                                }}
                                className={`text-base cursor-pointer transition ${
                                  (selectedTicket.user_rating || 0) >= star ? "text-amber-400 scale-110" : "text-slate-600 hover:text-amber-300"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        {selectedTicket.user_rating && (
                          <span className="text-[11px] text-amber-300 font-bold font-mono">
                            ★ {selectedTicket.user_rating}/5 Rated ({selectedTicket.user_feedback || "Verified"})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Assigned Rep: <strong className="text-slate-200">{selectedTicket.assigned_staff_name || "Support Staff Level 1"}</strong></span>
                      </div>

                      {selectedTicket.escalation_reason && (
                        <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Escalated Reason: {selectedTicket.escalation_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                    {selectedTicket.chat_messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender_role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1 font-mono">
                          <strong>{msg.sender_name}</strong>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 uppercase text-[9px]">
                            {msg.sender_role}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                            msg.sender_role === "user"
                              ? "bg-purple-600 text-white font-medium rounded-tr-none shadow-md"
                              : msg.is_internal_note
                              ? "bg-amber-950/40 border border-amber-500/40 text-amber-200 rounded-tl-none font-mono"
                              : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
                      placeholder={selectedTicket.status === "resolved" ? "Ticket is resolved. Type to auto-reopen..." : "Type your response to support agent..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={chatLoading || !replyText.trim()}
                      className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-500">
                  <LifeBuoy className="w-12 h-12 stroke-1" />
                  <p className="text-xs">Select a ticket from the left sidebar to view live chat</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE NEW TICKET FORM */}
        {activeTab === "new_ticket" && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 font-sans">
            <div className="space-y-1 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Submit New Support Ticket</h3>
              <p className="text-xs text-slate-400">
                Our Level-1 Support team responds within 15 minutes. Escalated tickets are reviewed by Support Managers.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Issue Subject / Category</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-bold"
                  placeholder="e.g. Loan foreclosure status mismatch / Tax PDF export inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Priority Level</label>
                <select
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-bold"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="normal">Normal Priority (Standard Response)</option>
                  <option value="high">High Priority (Within 1 Hour)</option>
                  <option value="urgent">Urgent Priority (Immediate Escalation)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300">Detailed Message / Account Problem Description</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none font-sans"
                  placeholder="Provide your loan ID, transaction reference numbers, or exact details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tickets")}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-xl disabled:opacity-50"
                >
                  {submitting ? "Submitting Ticket..." : "Submit Ticket & Start Chat"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: FREQUENTLY ASKED QUESTIONS (FAQS — 50+ INDEXED ITEMS) */}
        {activeTab === "faq" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Box & Category Filters */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 focus-within:border-purple-500 transition">
                <Search className="w-5 h-5 text-purple-400 shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
                  placeholder="Search 50+ FAQs (e.g. foreclosure, monad, hindi ai, cibil, dti, tax)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <span className="font-mono text-purple-400 font-bold">
                  Showing {searchFAQS(searchQuery).length} of {COMPREHENSIVE_50_FAQS.length} Indexed FAQs
                </span>
                <span className="text-[10px] text-slate-500">💡 AI Assistant has direct access to all 50+ FAQ items</span>
              </div>
            </div>

            {/* FAQs List Accordion / Grid */}
            <div className="space-y-4">
              {searchFAQS(searchQuery).map((faq) => (
                <div
                  key={faq.id}
                  className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-lg hover:border-purple-500/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" /> {faq.q}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                      {faq.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium pl-6">{faq.a}</p>

                  <div className="pt-2 flex flex-wrap gap-1.5 pl-6">
                    {faq.tags.map((t) => (
                      <span key={t} className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
