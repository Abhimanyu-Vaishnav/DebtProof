"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { DashboardData } from "@/types";

interface MultiCurrencyWidgetProps {
  data: DashboardData;
}

const SUPPORTED_CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", flag: "🇸🇬", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵", name: "Japanese Yen" },
];

// Fallback rates from INR (updated periodically — user can see live rates if API loads)
const FALLBACK_RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.01196,
  EUR: 0.01099,
  GBP: 0.00937,
  AED: 0.04393,
  SGD: 0.01598,
  JPY: 1.8423,
};

function formatAmount(amount: number, currency: string, symbol: string): string {
  if (amount >= 10_000_000) {
    return `${symbol}${(amount / 10_000_000).toFixed(2)}Cr`;
  } else if (amount >= 100_000) {
    return `${symbol}${(amount / 100_000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `${symbol}${amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export function MultiCurrencyWidget({ data }: MultiCurrencyWidgetProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES_FROM_INR);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      // Using exchangerate-api.com free tier (no key required for latest)
      const res = await fetch("https://open.er-api.com/v6/latest/INR");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json?.rates) {
        setRates(json.rates as Record<string, number>);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        setRatesLoaded(true);
      }
    } catch {
      // Use fallback silently
      setRatesLoaded(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) ?? SUPPORTED_CURRENCIES[0];
  const rate = rates[selectedCurrency] ?? FALLBACK_RATES_FROM_INR[selectedCurrency] ?? 1;

  const convert = useCallback(
    (inrAmount: number) => inrAmount * rate,
    [rate]
  );

  const metrics = useMemo(() => [
    {
      label: "Total Outstanding",
      value: data.total_outstanding,
      color: "text-[var(--color-error)]",
      icon: "📉",
    },
    {
      label: "Upcoming EMI",
      value: data.upcoming_emi_amount,
      color: "text-[var(--color-warning)]",
      icon: "📅",
    },
    {
      label: "Total Paid",
      value: data.total_paid_active,
      color: "text-emerald-400",
      icon: "✅",
    },
    {
      label: "Interest Paid",
      value: data.total_interest_paid,
      color: "text-purple-400",
      icon: "💸",
    },
  ], [data]);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-yellow-400 to-emerald-500" />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Multi-Currency Tracker 💱</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {ratesLoaded && lastUpdated ? `Live rates · ${lastUpdated}` : "Fallback rates (INR base)"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRates}
          title="Refresh live rates"
          className="text-[10px] font-semibold text-[var(--color-primary-light)] hover:underline flex items-center gap-1"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Currency Selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SUPPORTED_CURRENCIES.map((cur) => (
          <button
            key={cur.code}
            onClick={() => setSelectedCurrency(cur.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCurrency === cur.code
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            <span>{cur.flag}</span>
            <span>{cur.code}</span>
          </button>
        ))}
      </div>

      {/* Rate Strip */}
      {selectedCurrency !== "INR" && (
        <div className="flex items-center gap-2 bg-[var(--color-surface-secondary)] rounded-xl px-4 py-2 mb-5 text-xs">
          <span className="text-[var(--color-text-tertiary)]">1 INR =</span>
          <span className="font-black text-[var(--color-primary)]">
            {rate.toFixed(rate < 0.01 ? 6 : rate < 1 ? 4 : 2)} {currentCurrency.symbol} {selectedCurrency}
          </span>
          <span className="text-[var(--color-text-tertiary)] ml-auto">{currentCurrency.flag} {currentCurrency.name}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-[var(--color-surface-secondary)] rounded-xl p-4 border border-[var(--color-border-light)]"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">{m.icon}</span>
              <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide">{m.label}</span>
            </div>
            <p className={`text-base font-black ${m.color} leading-tight`}>
              {formatAmount(convert(m.value), selectedCurrency, currentCurrency.symbol)}
            </p>
            {selectedCurrency !== "INR" && (
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                ≈ ₹{m.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-[var(--color-text-tertiary)] text-center mt-4">
        {ratesLoaded ? "Live rates from open.er-api.com" : "Using approximate fallback rates"} · For reference only, not financial advice
      </p>
    </div>
  );
}
