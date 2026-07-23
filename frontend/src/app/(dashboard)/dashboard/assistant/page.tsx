/**
 * DebtProof — AI Financial Assistant Page
 * Real-data chat interface powered by DebtProof's own calculation engine.
 * Zero mock responses — all answers computed from actual user DB.
 */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Topbar } from "@/components/layout/Topbar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Insight {
  id: string;
  icon: string;
  color: string;
  title: string;
  message: string;
  priority: number;
}

const QUICK_PROMPTS = [
  { label: "💰 Interest paid", text: "How much total interest have I paid across all my loans?" },
  { label: "🏆 Close first", text: "Which loan should I close first to save maximum money?" },
  { label: "📊 Debt ratio", text: "What is my current debt ratio and monthly EMI burden?" },
  { label: "❄️ Snowball plan", text: "Show me the debt snowball repayment order for my loans." },
  { label: "🌊 Avalanche plan", text: "Show me the debt avalanche repayment order for my loans." },
  { label: "💸 Net worth", text: "What is my estimated net worth right now?" },
  { label: "📝 Summary", text: "Give me a complete financial summary of my current situation." },
  { label: "💡 Save money", text: "How can I save money on interest and accelerate debt payoff?" },
];

const INSIGHT_COLORS: Record<string, string> = {
  blue: "border-blue-500/30 bg-blue-500/5",
  orange: "border-orange-500/30 bg-orange-500/5",
  red: "border-red-500/30 bg-red-500/5",
  green: "border-emerald-500/30 bg-emerald-500/5",
  purple: "border-purple-500/30 bg-purple-500/5",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"chat" | "insights">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await apiClient.get("/ai/insights/");
      setInsights(res.data.insights || []);
    } catch {
      // insights are optional
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  // Add welcome message on first load
  useEffect(() => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your DebtProof AI Financial Assistant.\n\nI analyze your actual loan data, payment history, and interest records to give you precise financial insights.\n\nAsk me anything — or pick a quick prompt below!",
      created_at: new Date().toISOString(),
    }]);
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post("/ai/chat/", {
        message: messageText,
        conversation_id: conversationId,
      });
      const data = res.data;
      setConversationId(data.conversation_id);

      const assistantMsg: Message = {
        id: data.message_id || `asst-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const errorText = axiosErr?.response?.data?.error || "Failed to get AI response. Please try again.";
      showToast(errorText, "error");
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${errorText}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <Topbar title="AI Financial Assistant" subtitle="Real-data intelligence powered by your actual financial records" />
      <main className="page-content">
        <div className="max-w-5xl mx-auto space-y-4 animate-fade-in" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          {/* Tab switcher */}
          <div className="flex gap-2 flex-shrink-0">
            {(["chat", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                  activeView === tab
                    ? "bg-[var(--color-primary)] text-white shadow"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
              >
                {tab === "chat" ? "🤖 AI Chat" : `💡 Live Insights (${insights.length})`}
              </button>
            ))}
          </div>

          {/* Insights View */}
          {activeView === "insights" && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {insightsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-[var(--color-surface-secondary)] animate-pulse" />
                ))
              ) : insights.length === 0 ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Add loans and record payments to generate real AI insights.
                  </p>
                </div>
              ) : (
                insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-2xl p-5 transition ${INSIGHT_COLORS[insight.color] || INSIGHT_COLORS.blue}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <p className="text-sm font-black text-[var(--color-text-primary)]">{insight.title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Chat View */}
          {activeView === "chat" && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-black mr-2 flex-shrink-0 mt-1">
                        AI
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[var(--color-primary)] text-white rounded-br-md"
                        : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-bl-md border border-[var(--color-border-light)]"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/70" : "text-[var(--color-text-tertiary)]"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-black mr-2 flex-shrink-0">
                      AI
                    </div>
                    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1 items-center h-5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="flex-shrink-0 overflow-x-auto">
                <div className="flex gap-2 pb-1" style={{ minWidth: "max-content" }}>
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => sendMessage(p.text)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] border border-[var(--color-border)] transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="flex-shrink-0 flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask me anything about your finances… (Enter to send)"
                  className="flex-1 input text-sm resize-none"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-5 flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "..." : "Send →"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
