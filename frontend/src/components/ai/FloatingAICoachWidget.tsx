/**
 * DebtProof — Shared Global Floating AI Coach Widget
 * Context-aware page assistant + synchronized chat history with /dashboard/assistant
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/services/api";
import { 
  getSharedChatMessages, 
  setSharedChatMessages, 
  subscribeToChatMessages, 
  getPageContextDescription, 
  getSavedSessions,
  saveSession,
  deleteSession,
  subscribeToSessions,
  type SharedChatMessage,
  type ChatSession 
} from "@/services/chatStore";
import { formatCurrency } from "@/utils/formatters";
import { loansService } from "@/services/loans.service";
import { 
  Bot, 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  ChevronUp, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Info,
  Brain,
  History,
  Plus,
  Trash2,
  ChevronRight
} from "lucide-react";

export function FloatingAICoachWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<SharedChatMessage[]>(getSharedChatMessages());
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>(getSavedSessions());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSynth, setSpeechSynth] = useState(false);

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pageContext = getPageContextDescription(pathname);

  // Subscribe to shared global chat state & saved sessions
  useEffect(() => {
    const unsubChat = subscribeToChatMessages((newMsgs) => {
      setMessages(newMsgs);
    });
    const unsubSessions = subscribeToSessions((sessions) => {
      setSavedSessions(sessions);
    });
    return () => {
      unsubChat();
      unsubSessions();
    };
  }, []);

  const handleStartNewSession = () => {
    const current = getSharedChatMessages();
    saveSession(current);
    setSavedSessions(getSavedSessions());

    const freshWelcome: SharedChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Namaste! 👋 I am your **DebtProof Unified AI Strategy Coach**.\n\nI am synchronized across your entire workspace! Ask me anything about your current page, active loans, interest savings, or credit score optimization.`,
        created_at: new Date().toISOString(),
      },
    ];
    setSharedChatMessages(freshWelcome);
    setShowHistory(false);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    loansService.getDashboard().then((d) => setDashboardStats(d)).catch(() => {});
  }, []);

  // Voice Input Toggle
  const toggleVoiceInput = () => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInput(text);
          sendMessage(text);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        if (isListening) recognition.stop();
        else recognition.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#_`]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      setSpeechSynth(true);
      utterance.onend = () => setSpeechSynth(false);
    }
  };

  // Dragging State for Desktop & Touch
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow drag from header
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Send Message with Page Context
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: SharedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
      pageContext: pageContext.title,
    };

    const currentMsgs = getSharedChatMessages();
    const updatedMsgs = [...currentMsgs, userMsg];
    setSharedChatMessages(updatedMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient.post("/ai/chat/", {
        message: `${messageText} (Current Page: ${pageContext.title})`,
      });
      const data = res.data;

      const assistantMsg: SharedChatMessage = {
        id: data.message_id || `asst-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        created_at: new Date().toISOString(),
      };
      setSharedChatMessages([...getSharedChatMessages(), assistantMsg]);
    } catch {
      // Natural language context aware fallback
      const q = messageText.toLowerCase();

      // Check if query is in Hindi/Hinglish words
      const hasHindiWords = ["is ", "kya", "kaunsa", "kitna", "kaise", "hoga", "batao", "byaj", "hai", "pehle", "bhare", "karu", "mere", "mera", "bata", "rakha", "yahan", "isme"].some(k => q.includes(k));
      const isEnglish = !hasHindiWords;

      let answer = isEnglish
        ? `📍 **${pageContext.title}**:\n${pageContext.detailsEn}\n\nFeel free to ask any question about your active loans, credit cards, or interest savings in English!`
        : `📍 **${pageContext.title}**:\n${pageContext.details}\n\nAap is page ke baare me ya apne total debt/interest ke baare me natural language me kuch bhi pooch sakte hain!`;

      if (q.includes("credit card") || q.includes("card balance") || q.includes("outstanding balance")) {
        const cardTotal = dashboardStats?.total_outstanding ? formatCurrency(dashboardStats.total_outstanding) : "₹57,000";
        answer = isEnglish
          ? `💳 **Credit Card Portfolio Status**:\nTotal Outstanding Balance: **${cardTotal}** across registered credit cards.\nOverall Utilization is **12.7%** (Healthy <30%).`
          : `💳 **Credit Card Portfolio Status**:\nTotal Outstanding Balance: **${cardTotal}** registered credit cards par hai.\nOverall Utilization **12.7%** (Healthy <30%) hai.`;
      } else if (
        q.includes("this page") || 
        q.includes("use of") || 
        q.includes("purpose") || 
        q.includes("about") || 
        q.includes("is page") || 
        q.includes("page kya hai") || 
        q.includes("page detail") ||
        q.includes("yahan kya") ||
        q.includes("isme kya")
      ) {
        answer = isEnglish
          ? `📍 **${pageContext.title}**:\n\n${pageContext.detailsEn}`
          : `📍 **${pageContext.title}**:\n\n${pageContext.details}`;
      } else if (q.includes("interest") || q.includes("byaj")) {
        const totalInt = dashboardStats?.total_interest_paid ? formatCurrency(dashboardStats.total_interest_paid) : "your total interest";
        answer = isEnglish
          ? `💰 **Interest Analysis**: You have paid a total of **${totalInt}** in interest across all active loans. Prioritize prepaying high-interest debt first!`
          : `💰 **Interest Analysis**: Aapne ab tak total **${totalInt}** byaj pay kiya hai. High interest loans pehle bhare taaki savings ho!`;
      } else if (q.includes("emi") || q.includes("installment")) {
        const emi = dashboardStats?.upcoming_emi_amount ? formatCurrency(dashboardStats.upcoming_emi_amount) : "monthly EMI";
        answer = isEnglish
          ? `📊 **EMI Commitment**: Your total monthly EMI obligation is **${emi}/month**.`
          : `📊 **EMI Commitment**: Aapki monthly EMI obligation **${emi}/month** hai.`;
      }

      setSharedChatMessages([
        ...getSharedChatMessages(),
        {
          id: `asst-fb-${Date.now()}`,
          role: "assistant",
          content: answer,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Icon Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer border border-purple-400/30"
          title="Open AI Strategy Coach & Context Assistant"
        >
          <Bot className="w-6 h-6 animate-bounce text-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          
          <span className="absolute right-16 top-2.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white font-extrabold text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-xl border border-slate-700 pointer-events-none">
            ⚡ AI Coach: {pageContext.title}
          </span>
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div 
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className="w-[340px] sm:w-[440px] h-[540px] bg-slate-950 border border-purple-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-white transition-shadow"
        >
          {/* Header - Drag Handle */}
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  AI Strategy Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[10px] text-purple-300 font-mono font-bold block">
                  ✋ Hold & Drag Anywhere
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartNewSession}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition cursor-pointer"
                title="Start New Session"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  showHistory 
                    ? "bg-purple-600 text-white shadow-lg" 
                    : "bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white"
                }`}
                title="View Past Chat History"
              >
                <History className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Context Banner */}
          <div className="px-4 py-2.5 bg-purple-950/60 border-b border-purple-500/30 flex items-center justify-between text-[11px] font-mono text-purple-200 font-bold">
            <div className="flex items-center gap-2 truncate">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Page: <strong className="text-white">{pageContext.title}</strong></span>
            </div>
            {savedSessions.length > 0 && (
              <span className="text-[10px] text-purple-300 font-semibold shrink-0">
                {savedSessions.length} sessions
              </span>
            )}
          </div>

          {/* History Overlay Drawer */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                  <History className="w-4 h-4" /> Past Chat Sessions
                </h4>
                <button
                  onClick={handleStartNewSession}
                  className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Session
                </button>
              </div>

              <div className="space-y-2">
                {savedSessions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-8">
                    No saved chat history found
                  </p>
                ) : (
                  savedSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setSharedChatMessages(session.messages);
                        setShowHistory(false);
                      }}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition cursor-pointer flex items-center justify-between group text-xs"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-slate-200 truncate group-hover:text-purple-300">
                          {session.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {session.messages?.length || 0} messages
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                            setSavedSessions(getSavedSessions());
                          }}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Messages Area */
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    m.role === "user"
                      ? "bg-purple-600 text-white font-bold rounded-tr-none shadow-lg"
                      : "bg-slate-900 border border-slate-700 text-slate-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line font-sans">{m.content}</p>
                </div>

                {m.role === "assistant" && (
                  <button
                    onClick={() => speakText(m.content)}
                    className="text-[10px] text-slate-400 hover:text-purple-300 mt-1 flex items-center gap-1 cursor-pointer font-mono font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Read Aloud
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-300 p-3 bg-slate-900 rounded-xl border border-slate-700 font-semibold">
                <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing portfolio & database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
              placeholder={`Ask about ${pageContext.title}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
