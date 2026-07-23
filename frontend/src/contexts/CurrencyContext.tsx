/**
 * DebtProof — Global Currency Context
 * Auto-detects user's locale/currency from browser, persists to localStorage.
 * Provides useCurrency() hook for all components.
 */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ── Currency Definitions ─────────────────────────────────────────────────────

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
  /** Indian lakh/crore formatting instead of million/billion */
  useIndianFormat?: boolean;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee",          flag: "🇮🇳", locale: "en-IN", useIndianFormat: true },
  { code: "USD", symbol: "$", name: "US Dollar",             flag: "🇺🇸", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro",                  flag: "🇪🇺", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound",         flag: "🇬🇧", locale: "en-GB" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham",          flag: "🇦🇪", locale: "ar-AE" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",     flag: "🇸🇬", locale: "en-SG" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen",          flag: "🇯🇵", locale: "ja-JP" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan",          flag: "🇨🇳", locale: "zh-CN" },
  { code: "KRW", symbol: "₩", name: "South Korean Won",      flag: "🇰🇷", locale: "ko-KR" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar",     flag: "🇨🇦", locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar",    flag: "🇦🇺", locale: "en-AU" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc",          flag: "🇨🇭", locale: "de-CH" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit",    flag: "🇲🇾", locale: "ms-MY" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka",      flag: "🇧🇩", locale: "bn-BD" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee",       flag: "🇵🇰", locale: "ur-PK" },
  { code: "NPR", symbol: "₨", name: "Nepali Rupee",          flag: "🇳🇵", locale: "ne-NP" },
  { code: "LKR", symbol: "₨", name: "Sri Lankan Rupee",      flag: "🇱🇰", locale: "si-LK" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal",           flag: "🇸🇦", locale: "ar-SA" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling",     flag: "🇰🇪", locale: "sw-KE" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira",        flag: "🇳🇬", locale: "en-NG" },
  { code: "ZAR", symbol: "R", name: "South African Rand",    flag: "🇿🇦", locale: "en-ZA" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real",       flag: "🇧🇷", locale: "pt-BR" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso",        flag: "🇲🇽", locale: "es-MX" },
  { code: "THB", symbol: "฿", name: "Thai Baht",             flag: "🇹🇭", locale: "th-TH" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah",    flag: "🇮🇩", locale: "id-ID" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal",          flag: "🇶🇦", locale: "ar-QA" },
];

// ── Locale → Currency Mapping ────────────────────────────────────────────────

const LOCALE_TO_CURRENCY: Record<string, string> = {
  // Indian subcontinent
  "en-in": "INR", "hi": "INR", "hi-in": "INR", "bn-in": "INR",
  "mr": "INR", "ta": "INR", "te": "INR", "gu": "INR", "kn": "INR",
  "ml": "INR", "pa": "INR",
  // Bangladesh
  "bn-bd": "BDT", "bn": "BDT",
  // Pakistan
  "ur": "PKR", "ur-pk": "PKR",
  // Nepal
  "ne": "NPR", "ne-np": "NPR",
  // Sri Lanka
  "si": "LKR", "si-lk": "LKR",
  // USA / English default
  "en-us": "USD", "en": "USD",
  // UK
  "en-gb": "GBP",
  // Europe (EUR zone)
  "de": "EUR", "de-de": "EUR", "fr": "EUR", "fr-fr": "EUR",
  "es": "EUR", "es-es": "EUR", "it": "EUR", "it-it": "EUR",
  "nl": "EUR", "nl-nl": "EUR", "pt-pt": "EUR", "el": "EUR",
  "fi": "EUR", "sv-fi": "EUR", "sk": "EUR", "sl": "EUR",
  // UAE
  "ar-ae": "AED",
  // Saudi Arabia
  "ar-sa": "SAR",
  // Qatar
  "ar-qa": "QAR",
  // Singapore
  "en-sg": "SGD", "zh-sg": "SGD", "ms-sg": "SGD",
  // Malaysia
  "ms": "MYR", "ms-my": "MYR", "en-my": "MYR",
  // Japan
  "ja": "JPY", "ja-jp": "JPY",
  // China
  "zh": "CNY", "zh-cn": "CNY",
  // Korea
  "ko": "KRW", "ko-kr": "KRW",
  // Canada
  "en-ca": "CAD", "fr-ca": "CAD",
  // Australia
  "en-au": "AUD",
  // Switzerland
  "de-ch": "CHF", "fr-ch": "CHF", "it-ch": "CHF",
  // Kenya
  "sw": "KES", "sw-ke": "KES", "en-ke": "KES",
  // Nigeria
  "en-ng": "NGN", "yo": "NGN", "ha": "NGN",
  // South Africa
  "en-za": "ZAR", "af": "ZAR",
  // Brazil
  "pt-br": "BRL", "pt": "BRL",
  // Mexico
  "es-mx": "MXN",
  // Thailand
  "th": "THB", "th-th": "THB",
  // Indonesia
  "id": "IDR", "id-id": "IDR",
};

function detectCurrencyFromBrowser(): string {
  if (typeof navigator === "undefined") return "INR";

  // 1. Try Timezone offset & timezone name matching
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Colombo") === false && tz.startsWith("Asia/Kolkata")) return "INR";
      if (tz.includes("America/") || tz.includes("US/")) return "USD";
      if (tz.includes("Europe/London")) return "GBP";
      if (tz.includes("Europe/")) return "EUR";
      if (tz.includes("Dubai") || tz.includes("Muscat")) return "AED";
      if (tz.includes("Singapore")) return "SGD";
      if (tz.includes("Tokyo")) return "JPY";
      if (tz.includes("Shanghai") || tz.includes("Chongqing") || tz.includes("Urumqi")) return "CNY";
      if (tz.includes("Seoul")) return "KRW";
      if (tz.includes("Dhaka")) return "BDT";
      if (tz.includes("Karachi")) return "PKR";
      if (tz.includes("Kathmandu")) return "NPR";
      if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane")) return "AUD";
      if (tz.includes("Toronto") || tz.includes("Vancouver")) return "CAD";
    }
  } catch {/* ignore */}

  // 2. Try browser languages
  const langs = [...(navigator.languages || [navigator.language || "en"])];
  for (const lang of langs) {
    const code = LOCALE_TO_CURRENCY[lang.toLowerCase()];
    if (code) return code;
    // Try just the primary language tag
    const primary = lang.split("-")[0].toLowerCase();
    const fallback = LOCALE_TO_CURRENCY[primary];
    if (fallback) return fallback;
  }

  return "INR"; // Default fallback
}

// ── Format Helpers ───────────────────────────────────────────────────────────

export function formatAmountWithCurrency(
  amount: number | string,
  config: CurrencyConfig,
  compact = false
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${config.symbol}0`;

  if (compact) {
    if (config.useIndianFormat) {
      if (Math.abs(num) >= 10_000_000) return `${config.symbol}${(num / 10_000_000).toFixed(2)}Cr`;
      if (Math.abs(num) >= 100_000)    return `${config.symbol}${(num / 100_000).toFixed(2)}L`;
      if (Math.abs(num) >= 1000)       return `${config.symbol}${(num / 1000).toFixed(1)}K`;
      return `${config.symbol}${num.toFixed(0)}`;
    } else {
      if (Math.abs(num) >= 1_000_000_000) return `${config.symbol}${(num / 1_000_000_000).toFixed(2)}B`;
      if (Math.abs(num) >= 1_000_000)     return `${config.symbol}${(num / 1_000_000).toFixed(2)}M`;
      if (Math.abs(num) >= 1000)          return `${config.symbol}${(num / 1000).toFixed(1)}K`;
      return `${config.symbol}${num.toFixed(0)}`;
    }
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      maximumFractionDigits: config.code === "JPY" || config.code === "KRW" ? 0 : 0,
    }).format(num);
  } catch {
    return `${config.symbol}${num.toLocaleString()}`;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

export interface DashboardWidgetSettings {
  showOverviewCards: boolean;
  showIncomeTracker: boolean;
  showPayoffMilestones: boolean;
  showLoanPortfolio: boolean;
  showAiAdvisor: boolean;
  showCreditUtilization: boolean;
  showEmergencyBuffer: boolean;
  showEmiBounceProtection: boolean;
  showMultiCurrency: boolean;
  showQuickActions: boolean;
  showProjections: boolean;
}

export interface AppSettings {
  currencyCode: string;
  compactNumbers: boolean;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  theme: "dark" | "light" | "emerald" | "midnight" | "titanium";
  emiReminderDays: number;
  overdueAlerts: boolean;
  paymentConfirmation: boolean;
  dashboardWidgets: DashboardWidgetSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  currencyCode: "INR",
  compactNumbers: false,
  dateFormat: "DD/MM/YYYY",
  theme: "titanium",
  emiReminderDays: 3,
  overdueAlerts: true,
  paymentConfirmation: true,
  dashboardWidgets: {
    showOverviewCards: true,
    showIncomeTracker: true,
    showPayoffMilestones: true,
    showLoanPortfolio: true,
    showAiAdvisor: true,
    showCreditUtilization: true,
    showEmergencyBuffer: true,
    showEmiBounceProtection: true,
    showMultiCurrency: true,
    showQuickActions: true,
    showProjections: true,
  },
};

const STORAGE_KEY = "debtproof_settings";

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {/* ignore */}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {/* ignore */}
}

interface CurrencyContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  currency: CurrencyConfig;
  format: (amount: number | string) => string;
  autoDetectCurrency: () => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage + auto-detect on mount
  useEffect(() => {
    const stored = loadSettings();
    // If no currency stored yet, auto-detect
    if (!localStorage.getItem(STORAGE_KEY)) {
      stored.currencyCode = detectCurrencyFromBrowser();
    }
    setSettings(stored);
    setMounted(true);
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Theme vars
    const themes: Record<string, { primary: string; accent: string; primaryLight: string }> = {
      titanium:  { primary: "#2563a8", accent: "#10b981", primaryLight: "#3b82f6" },
      emerald:   { primary: "#059669", accent: "#34d399", primaryLight: "#10b981" },
      midnight:  { primary: "#4f46e5", accent: "#818cf8", primaryLight: "#6366f1" },
    };
    const t = themes[settings.theme] ?? themes.titanium;
    root.style.setProperty("--color-primary", t.primary);
    root.style.setProperty("--color-accent", t.accent);
    root.style.setProperty("--color-primary-light", t.primaryLight);
  }, [settings.theme, mounted]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const autoDetectCurrency = useCallback(() => {
    const detected = detectCurrencyFromBrowser();
    updateSettings({ currencyCode: detected });
    return detected;
  }, [updateSettings]);

  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === settings.currencyCode) ?? CURRENCIES[0],
    [settings.currencyCode]
  );

  const format = useCallback(
    (amount: number | string) =>
      formatAmountWithCurrency(amount, currency, settings.compactNumbers),
    [currency, settings.compactNumbers]
  );

  const value = useMemo(
    () => ({ settings, updateSettings, currency, format, autoDetectCurrency }),
    [settings, updateSettings, currency, format, autoDetectCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback for components outside provider (SSR safety)
    const fallbackCurrency = CURRENCIES[0];
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: () => {},
      currency: fallbackCurrency,
      format: (amount) => formatAmountWithCurrency(amount, fallbackCurrency, false),
      autoDetectCurrency: () => "INR",
    };
  }
  return ctx;
}
