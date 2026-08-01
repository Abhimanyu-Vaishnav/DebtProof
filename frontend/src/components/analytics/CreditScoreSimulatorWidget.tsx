"use client";

import React, { useState } from "react";
import { Gauge, TrendingUp, Sparkles, CheckCircle, Info, RefreshCw } from "lucide-react";

export function CreditScoreSimulatorWidget() {
  const [currentScore, setCurrentScore] = useState<number>(685);
  const [cardUtilization, setCardUtilization] = useState<number>(65); // percentage
  const [payoffAmount, setPayoffAmount] = useState<number>(45000);
  const [timelineMonths, setTimelineMonths] = useState<number>(6);

  // Dynamic score simulation calculation
  const utilImpact = Math.max(0, (65 - cardUtilization) * 1.8);
  const payoffImpact = Math.min(60, (payoffAmount / 10000) * 4);
  const timeBonus = timelineMonths * 3;
  const projectedScore = Math.min(850, Math.round(currentScore + utilImpact + payoffImpact + timeBonus));
  const scoreDiff = projectedScore - currentScore;

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-emerald-400 border-emerald-500/40 bg-emerald-950/30";
    if (score >= 700) return "text-teal-400 border-teal-500/40 bg-teal-950/30";
    if (score >= 650) return "text-yellow-400 border-yellow-500/40 bg-yellow-950/30";
    return "text-rose-400 border-rose-500/40 bg-rose-950/30";
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden text-slate-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Credit Score & CIBIL Simulator <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">Model how debt payoffs affect your credit score over time</p>
          </div>
        </div>
        <button
          onClick={() => {
            setCardUtilization(30);
            setPayoffAmount(60000);
            setTimelineMonths(6);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Optimal Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Sliders */}
        <div className="lg:col-span-2 space-y-5">
          {/* Starting Score */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Current Credit Score</span>
              <span className="text-indigo-400 font-bold">{currentScore} CIBIL</span>
            </div>
            <input
              type="range"
              min="550"
              max="800"
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Credit Utilization Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Target Credit Card Utilization</span>
              <span className={`font-bold ${cardUtilization <= 30 ? "text-emerald-400" : "text-amber-400"}`}>
                {cardUtilization}% {cardUtilization <= 30 ? "(Recommended <30%)" : "(High)"}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              value={cardUtilization}
              onChange={(e) => setCardUtilization(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Extra Payoff Amount */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Lump Sum Extra Principal Payoff</span>
              <span className="text-emerald-400 font-bold">₹{payoffAmount.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={payoffAmount}
              onChange={(e) => setPayoffAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          {/* Horizon Months */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Time Horizon</span>
              <span className="text-cyan-400 font-bold">{timelineMonths} Months</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setTimelineMonths(m)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    timelineMonths === m
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {m} Mo
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Card Output */}
        <div className="flex flex-col justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-5">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Projected Credit Rating
            </span>

            <div className={`p-4 rounded-xl border ${getScoreColor(projectedScore)} text-center mb-4`}>
              <div className="text-4xl font-extrabold tracking-tight">{projectedScore}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold mt-1">
                <TrendingUp className="w-4 h-4" /> +{scoreDiff} Points Increase
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Card utilization drop adds approx +{Math.round(utilImpact)} points.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>₹{payoffAmount.toLocaleString("en-IN")} debt reduction adds +{Math.round(payoffImpact)} points.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>On-time payment streak ({timelineMonths} mo) adds +{timeBonus} points.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Simulated estimate based on standard credit bureau weighting algorithms.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
