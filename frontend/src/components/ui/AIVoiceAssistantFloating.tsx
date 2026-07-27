"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export function AIVoiceAssistantFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Tap the mic button and ask me anything about your loans, interest, or payoff plan!");
  const [recognition, setRecognition] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-IN";

      rec.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          handleVoiceCommand(text);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) {
      showToast("Speech recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setAiResponse("Listening...");
      recognition.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const q = command.toLowerCase();
    let reply = "I analyzed your query. You can view full debt metrics across your Dashboard modules!";

    if (q.includes("interest") || q.includes("paid")) {
      reply = "You have paid a total of ₹1,42,500 in interest this year. Closing your highest-rate loan first saves maximum money!";
    } else if (q.includes("loan") || q.includes("close first") || q.includes("priority")) {
      reply = "You should close your ICICI Credit Card debt first because it has a 36% per annum interest rate!";
    } else if (q.includes("net worth") || q.includes("balance")) {
      reply = "Your estimated net worth is ₹8,45,000 with total active liabilities of ₹6,70,000.";
    } else if (q.includes("repay") || q.includes("emi") || q.includes("due")) {
      reply = "Your next EMI payment of ₹12,400 is due in 3 days for your HDFC Home Loan.";
    } else if (q.includes("proof") || q.includes("blockchain") || q.includes("monad")) {
      reply = "All your payment receipts are cryptographically hashed and anchored on Monad Testnet Chain ID 10143.";
    }

    setAiResponse(reply);
    speakText(reply);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-5 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-white/20"
        title="Voice AI Assistant"
      >
        <span className="text-xl">🎙️</span>
      </button>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed bottom-40 right-5 z-50 w-80 sm:w-96 card p-5 bg-[var(--color-surface)] border border-purple-500/30 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <div>
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">Hands-Free AI Voice Coach</h3>
                <p className="text-[10px] text-purple-400 font-mono">Web Speech Voice Interface</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">✕</button>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center space-y-3">
            <button
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-ping"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/30"
              }`}
            >
              🎙️
            </button>

            <p className="text-xs font-bold text-purple-400">
              {isListening ? "Listening to your voice..." : "Click mic button to speak"}
            </p>

            {transcript && (
              <p className="text-xs italic text-[var(--color-text-tertiary)] bg-black/20 p-2 rounded-lg font-mono">
                "{transcript}"
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">🤖 AI Audio Response</p>
            <p className="text-xs text-[var(--color-text-primary)] leading-relaxed font-medium">
              {aiResponse}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AIVoiceAssistantFloating;
