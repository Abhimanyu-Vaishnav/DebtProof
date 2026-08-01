"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Bot, Sparkles, Volume2, Send, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface VoiceMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function VoiceAssistantStudio() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Hello! I am DebtProof AI Assistant. You can speak to me or type your question about EMI schedules, interest savings, or Monad proofs.",
      timestamp: "Just now",
    },
  ]);
  const [typingInput, setTypingInput] = useState("");

  const startVoiceRecognition = () => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            handleUserSpeak(transcript);
          }
        };

        recognition.start();
      } catch {
        setIsListening(false);
        alert("Speech recognition not supported in this browser environment. Try typing instead.");
      }
    } else {
      alert("Speech recognition is supported on Chrome/Edge browsers. You can type your query below!");
    }
  };

  const handleUserSpeak = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscript("");
    setTypingInput("");

    // Simulate AI intelligent voice response
    setTimeout(() => {
      let responseText = "Based on your active loans, your next EMI payment of ₹28,500 for HDFC Home Loan is due in 5 days.";
      if (userText.toLowerCase().includes("interest") || userText.toLowerCase().includes("save")) {
        responseText = "Paying an extra ₹25,000 lump sum towards your highest APR Personal Loan will save you ₹68,400 in interest and reduce tenure by 7 months.";
      } else if (userText.toLowerCase().includes("proof") || userText.toLowerCase().includes("monad")) {
        responseText = "All your 12 recent loan payments are cryptographically anchored on Monad Testnet Block #19824102 with verified SHA-256 hashes.";
      }

      const aiMsg: VoiceMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/30 to-purple-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              AI Voice & Conversational Assistant Studio <Sparkles className="w-4 h-4 text-purple-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Speak or chat with DebtProof AI to query EMI schedules, debt avalanche strategies, and Monad on-chain proofs
            </p>
          </div>
        </div>

        <button
          onClick={startVoiceRecognition}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
            isListening
              ? "bg-rose-500 text-white animate-pulse shadow-rose-500/30"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? "Listening..." : "🎙️ Speak Voice Query"}
        </button>
      </div>

      {/* Voice Transcript Bar */}
      {transcript && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-mono rounded-xl flex items-center gap-2 animate-fadeIn">
          <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
          <span>Hearing: "{transcript}"</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-xl p-3.5 rounded-2xl text-xs space-y-1 ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 opacity-80">
                {m.sender === "user" ? "👤 You" : "🤖 DebtProof AI Assistant"}
              </div>
              <p className="leading-relaxed">{m.text}</p>
              <span className="text-[10px] text-slate-400 block text-right font-mono">{m.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUserSpeak(typingInput);
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={typingInput}
          onChange={(e) => setTypingInput(e.target.value)}
          placeholder="Ask anything (e.g. 'How much interest can I save by paying extra ₹20k?')..."
          className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
