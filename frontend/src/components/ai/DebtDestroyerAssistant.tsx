"use client";

import React, { useState } from "react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  strategyCard?: {
    name: string;
    interestSaved: string;
    monthsSaved: string;
    debtFreeDate: string;
  };
}

export function DebtDestroyerAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Hello! I am your AI Debt Destroyer & Financial Advisor. I analyze your active loans, interest rates, and EMI schedules to recommend optimal repayment acceleration strategies.",
      timestamp: "Just now",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const quickPrompts = [
    "🔥 Compare Avalanche vs Snowball payoff strategy",
    "📅 How can I become debt-free 6 months faster?",
    "💡 Should I pay off Credit Card or Personal Loan first?",
    "📊 Calculate my Debt-to-Income Risk Ratio",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setIsAnalyzing(true);

    setTimeout(() => {
      let aiResponseText = "";
      let strategyCard;

      if (query.includes("Avalanche vs Snowball") || query.includes("Compare")) {
        aiResponseText = "Based on your current 7 active loans, the **Debt Avalanche Strategy** (prioritizing highest 18.5% interest rate loans first) saves you the maximum money! However, the **Debt Snowball Strategy** clears 2 smaller loans within 90 days to give you quick psychological wins.";
        strategyCard = {
          name: "Debt Avalanche Recommended",
          interestSaved: "₹48,250",
          monthsSaved: "7 Months Faster",
          debtFreeDate: "October 2027",
        };
      } else if (query.includes("faster") || query.includes("debt-free")) {
        aiResponseText = "By allocating an extra **₹3,500/month** toward your highest-interest credit card loan, you will reduce your total repayment period from 36 months to 29 months, saving ₹32,100 in interest!";
      } else if (query.includes("Credit Card") || query.includes("first")) {
        aiResponseText = "Always pay off your **Credit Card Loan (18.5% p.a.)** before your Personal Loan (12.0% p.a.). High-interest compounding on credit cards destroys wealth the fastest.";
      } else {
        aiResponseText = "Your overall debt health is in Good Standing with a Credit Score of 750+. To maximize your savings, consider setting up automated monthly extra payments of ₹2,000 on your highest-rate loan.";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: "Just now",
        strategyCard,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="card p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-500 flex items-center justify-center text-lg shadow-lg shadow-rose-500/20">
            🤖
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              AI Debt Destroyer Assistant
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                ACTIVE AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Personalized payoff strategy & interest optimization engine</p>
          </div>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 ${
                m.sender === "user"
                  ? "bg-rose-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              {m.strategyCard && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-left mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{m.strategyCard.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">OPTIMAL</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
                    <div>Interest Saved: <b className="text-emerald-400 block">{m.strategyCard.interestSaved}</b></div>
                    <div>Time Saved: <b className="text-blue-400 block">{m.strategyCard.monthsSaved}</b></div>
                    <div>Debt Free By: <b className="text-purple-400 block">{m.strategyCard.debtFreeDate}</b></div>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            AI is calculating optimal repayment schedule...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI how to accelerate your loan payoff..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputMsg.trim()}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}
