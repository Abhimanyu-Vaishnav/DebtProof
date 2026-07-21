"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardData } from "@/types";

interface AIDebtAdvisorWidgetProps {
  data: DashboardData;
}

export function AIDebtAdvisorWidget({ data }: AIDebtAdvisorWidgetProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const totalOutstanding = data.total_outstanding || 0;
  const activeLoansCount = data.active_loans || 0;

  const prompts = [
    {
      id: "save-interest",
      label: "💡 How to save maximum interest?",
      answer: () =>
        `By switching to the **Debt Avalanche Strategy** (paying highest interest rate loan first) and adding an extra ₹5,000/month, you can save significant interest charges and become debt-free much faster!`,
    },
    {
      id: "which-first",
      label: "🎯 Which loan to clear first?",
      answer: () =>
        activeLoansCount > 0
          ? `Target your highest interest rate account first. If you prefer quick psychological wins, target the smallest balance loan (**Debt Snowball**) to build payoff momentum!`
          : `You currently have 0 active debts! Great job keeping your liabilities clean.`,
    },
    {
      id: "credit-score",
      label: "💳 Credit score improvement tip",
      answer: () =>
        `Keep your overall credit card utilization below **30%** of your total limit and ensure 0 overdue EMI payments. Timely payments contribute 35% to your credit score algorithm.`,
    },
  ];

  const handlePromptClick = (prompt: (typeof prompts)[0]) => {
    setSelectedPrompt(prompt.id);
    setIsThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiResponse(prompt.answer());
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="card p-5 border border-[var(--color-border-light)] space-y-4 bg-gradient-to-br from-indigo-950/20 via-[var(--color-surface)] to-[var(--color-surface-secondary)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
            🤖
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">AI Financial Payoff Assistant</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Smart insights based on your active liabilities ({formatCurrency(totalOutstanding)})</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          AI Active
        </span>
      </div>

      {/* Preset Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePromptClick(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              selectedPrompt === p.id
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* AI Output Response Area */}
      {isThinking && (
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center gap-3">
          <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">Analyzing portfolio and calculating interest projections...</span>
        </div>
      )}

      {aiResponse && !isThinking && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <span>✨ AI Advisor Insight</span>
          </div>
          <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">{aiResponse}</p>
        </div>
      )}
    </div>
  );
}
