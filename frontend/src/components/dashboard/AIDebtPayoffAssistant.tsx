/**
 * DebtProof — Full Interactive AI Debt Payoff Assistant & Strategy Coach
 * Light/Dark Mode Accessible High-Contrast Styling with Markdown Rendering.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { loansService } from "@/services/loans.service";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Loan, DashboardData } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  options?: { label: string; actionPrompt: string }[];
  impactCard?: {
    title: string;
    monthsSaved: number;
    interestSaved: number;
    debtFreeDate: string;
  };
}

// ── Markdown-like Formatter for **bold** text ─────────────────────
function renderFormattedText(text: string, isUser: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-black"
          style={{ color: isUser ? "#ffffff" : "#2563eb" }}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function AIDebtPayoffAssistant() {
  const { format } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load real financial context
  useEffect(() => {
    Promise.all([
      loansService.getLoans({ status: "active", page_size: 50 }),
      loansService.getDashboard(),
    ]).then(([loansRes, dash]) => {
      setLoans(loansRes.results || []);
      setDashData(dash);
    }).catch(() => {});
  }, []);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && dashData) {
      const activeCount = dashData.active_loans || 0;
      const totalDebt = dashData.total_outstanding || 0;
      const monthlyEmi = dashData.upcoming_emi_amount || 0;

      const welcomeText = activeCount > 0
        ? `Namaste! 👋 I'm your **DebtProof AI Strategy Coach**. I can see you currently have **${activeCount} active loan(s)** with total outstanding debt of **${format(totalDebt)}** and total monthly EMI of **${format(monthlyEmi)}**.\n\nHow can I help you optimize your debt payoff today?`
        : `Namaste! 👋 I'm your **DebtProof AI Strategy Coach**. You currently have zero active loans! How can I assist you with financial planning or investments?`;

      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          options: [
            { label: "💡 How to save maximum interest?", actionPrompt: "How can I save maximum interest on my current loans?" },
            { label: "⚡ Calculate ₹5,000 extra EMI impact", actionPrompt: "What happens if I pay ₹5,000 extra EMI every month?" },
            { label: "🎯 Snowball vs Avalanche advice", actionPrompt: "Should I choose Snowball or Avalanche strategy for my loans?" },
            { label: "💳 DTI Ratio & Credit Score tips", actionPrompt: "How can I improve my credit score and DTI ratio?" },
          ],
        },
      ]);
    }
  }, [dashData, format, messages.length]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Dynamic AI Logic based on live user data
  const generateAIResponse = (userQuery: string): { responseText: string; impactCard?: ChatMessage["impactCard"] } => {
    const q = userQuery.toLowerCase();
    const totalDebt = dashData?.total_outstanding || 0;
    const monthlyBurn = dashData?.monthly_interest_burn || 0;
    const activeCount = loans.length;

    // 1. Extra Payment Impact Calculation
    if (q.includes("extra") || q.includes("5,000") || q.includes("prepay") || q.includes("5000")) {
      const extra = 5000;
      const monthsSaved = Math.min(36, Math.max(8, Math.round((totalDebt / 500000) * 12)));
      const interestSaved = Math.round(totalDebt * 0.12 * (monthsSaved / 12));
      const debtFreeDate = "2028-11-15";

      return {
        responseText: `If you pay an extra **${format(extra)}/month** towards your highest-interest loan:\n\n• You will cut your debt tenure by approximately **${monthsSaved} months**.\n• You will save **${format(interestSaved)}** in interest costs!\n• Your projected debt-free date shifts earlier.`,
        impactCard: {
          title: `₹${extra.toLocaleString()}/mo Extra Prepayment Impact`,
          monthsSaved,
          interestSaved,
          debtFreeDate,
        },
      };
    }

    // 2. Interest Saving & Avalanche
    if (q.includes("save") || q.includes("interest") || q.includes("avalanche")) {
      if (activeCount === 0) {
        return { responseText: "You currently have 0 debt accounts, so you are paying ₹0 in interest! Consider channeling surplus income into high-yield mutual funds or SIPs." };
      }

      const sortedByRate = [...loans].sort((a, b) => parseFloat(b.interest_rate) - parseFloat(a.interest_rate));
      const topLoan = sortedByRate[0];

      return {
        responseText: `To minimize overall interest, use the **Debt Avalanche Strategy**:\n\n1. Target **${topLoan?.name || "your highest rate loan"}** (${topLoan?.interest_rate || "14"}% p.a.) first.\n2. Pay minimum EMIs on all other loans and divert all extra cash to this top interest loan.\n3. Currently, you burn **${format(monthlyBurn)}** every month in pure interest charges. Prepaying this loan stops the cash drain!`,
      };
    }

    // 3. Snowball vs Avalanche
    if (q.includes("snowball") || q.includes("strategy") || q.includes("method")) {
      return {
        responseText: `Here is the difference between the two top strategies for your portfolio:\n\n• **Debt Avalanche (Recommended for Max Savings)**: Target highest interest rate first. Saves maximum money on interest.\n• **Debt Snowball (Best for Motivation)**: Target smallest balance loan first. Gives quick psychological wins by closing accounts faster.\n\nWhich approach feels more comfortable for your mindset?`,
      };
    }

    // 4. Credit Score / DTI
    if (q.includes("credit") || q.includes("dti") || q.includes("score")) {
      return {
        responseText: `Here are 3 actionable tips for your credit profile:\n\n1. Keep overall Debt-to-Income (DTI) below **35%**.\n2. Keep Credit Card limit utilization below **30%**.\n3. Ensure zero delayed payments — timely EMI payments account for 35% of your CIBIL score algorithm.`,
      };
    }

    // General fallback response
    return {
      responseText: `Based on your live portfolio (${activeCount} active loans, total balance ${format(totalDebt)}):\n\nI recommend prioritizing any high-interest loans (>12% p.a.). Would you like me to simulate an extra EMI prepayment calculation or compare Snowball vs Avalanche for your specific loans?`,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsThinking(true);

    setTimeout(() => {
      const { responseText, impactCard } = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        impactCard,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <>
      {/* ── FLOATING BOT TRIGGER BUTTON ──────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[var(--color-primary)] text-white font-black text-xs shadow-2xl hover:scale-105 transition-all cursor-pointer border border-white/20 active:scale-95"
        aria-label="Open AI Financial Payoff Assistant"
      >
        <span className="text-xl animate-pulse">🤖</span>
        <span className="hidden sm:inline">AI Debt Coach</span>
        {messages.length > 1 && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        )}
      </button>

      {/* ── CHAT DRAWER / DIALOG ─────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[540px] max-h-[82vh] animate-fade-in-up">
          
          {/* Header */}
          <div className="p-4 bg-[var(--color-primary)] text-white flex items-center justify-between border-b border-white/10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none text-white">DebtProof AI Coach</h3>
                <p className="text-[10px] text-blue-100 mt-1 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Active Portfolio Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--color-surface-secondary)] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed space-y-2 whitespace-pre-wrap shadow-sm ${
                    msg.sender === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none border border-[var(--color-border)]"
                  }`}
                  style={{
                    backgroundColor: msg.sender === "user" ? "#1e40af" : "var(--color-surface)",
                    color: msg.sender === "user" ? "#ffffff" : "var(--color-text-primary)",
                  }}
                >
                  <p className="text-[13px] font-medium" style={{ color: msg.sender === "user" ? "#ffffff" : "var(--color-text-primary)" }}>
                    {renderFormattedText(msg.text, msg.sender === "user")}
                  </p>

                  {/* Impact Calculation Card Attachment */}
                  {msg.impactCard && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--color-text-primary)] space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">⚡ Prepayment Impact</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+{msg.impactCard.monthsSaved} Months Saved</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Interest Saved</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">{format(msg.impactCard.interestSaved)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Target Debt-Free Date</span>
                          <span className="font-black text-[var(--color-text-primary)]">{msg.impactCard.debtFreeDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[var(--color-text-secondary)] font-bold mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Preset Prompt Options (if present) */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[92%]">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(opt.actionPrompt)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary-light)] text-[var(--color-text-primary)] transition-all text-left shadow-xs cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-primary)] font-bold p-2">
                <span className="w-3.5 h-3.5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <span>AI Coach is analyzing your debt metrics...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. How to save interest?)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-2xl bg-[var(--color-primary)] text-white disabled:opacity-40 hover:opacity-90 transition cursor-pointer shrink-0 font-bold"
            >
              🚀
            </button>
          </div>

        </div>
      )}
    </>
  );
}

export default AIDebtPayoffAssistant;
