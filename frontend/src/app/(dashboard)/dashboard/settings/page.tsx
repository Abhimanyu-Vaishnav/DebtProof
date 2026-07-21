/**
 * DebtProof — Settings Page
 * Global app settings: currency, appearance, notifications, privacy.
 */
"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { useToast } from "@/components/ui/Toast";

type SettingsTab = "currency" | "appearance" | "dashboard" | "notifications" | "privacy" | "about";

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "currency",      label: "Currency & Region",  icon: "💰" },
  { id: "appearance",    label: "Appearance & Theme",  icon: "🎨" },
  { id: "dashboard",     label: "Dashboard Widgets",   icon: "🎛️" },
  { id: "notifications", label: "Notifications",       icon: "🔔" },
  { id: "privacy",       label: "Privacy & Security",  icon: "🔒" },
  { id: "about",         label: "About",               icon: "ℹ️" },
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2025)", example: "31/12/2025" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2025)", example: "12/31/2025" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-12-31)", example: "2025-12-31" },
] as const;

const THEMES = [
  { id: "dark",     label: "Dark Titanium", desc: "Default sleek dark theme", color: "#0f172a", accent: "#38bdf8" },
  { id: "light",    label: "Clean Light",   desc: "Clean light contrast theme", color: "#ffffff", accent: "#10b981" },
  { id: "emerald",  label: "Deep Emerald",  desc: "Lush green accent",        color: "#022c22", accent: "#34d399" },
  { id: "midnight", label: "Midnight Blue", desc: "Indigo violet palette",    color: "#0f172a", accent: "#818cf8" },
] as const;

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] ${
        checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-tertiary)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-border-light)] last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--color-border-light)] bg-[var(--color-surface-secondary)]">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, currency, format, autoDetectCurrency } = useCurrency();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("currency");
  const [searchCurrency, setSearchCurrency] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCurrency.toLowerCase()) ||
      c.code.toLowerCase().includes(searchCurrency.toLowerCase()) ||
      c.symbol.includes(searchCurrency)
  );

  const handleAutoDetect = () => {
    autoDetectCurrency();
    showToast(`Currency auto-detected: ${currency.code} ${currency.flag}`, "success");
  };

  const handleSave = () => {
    showToast("Settings saved successfully!", "success");
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings,
      note: "DebtProof user settings export",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debtproof_settings.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Settings exported!", "success");
  };

  const handleClearData = () => {
    localStorage.removeItem("debtproof_settings");
    setShowClearConfirm(false);
    showToast("Local settings cleared. Refreshing...", "info");
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Personalise DebtProof for your region" />
      <main className="page-content">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-surface-secondary)] to-[var(--color-surface-secondary)] border border-[var(--color-primary)]/20 p-6 mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2"/>
              <path d="M100 40v120M60 60l80 80M140 60L60 140" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-1">Global Settings</p>
              <h1 className="text-xl font-black text-[var(--color-text-primary)]">Your Preferences</h1>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                Currently using: <span className="font-bold text-[var(--color-text-primary)]">{currency.flag} {currency.name} ({currency.code})</span>
                <span className="ml-3 text-[var(--color-primary)] font-bold">{format(1234567)}</span>
              </p>
            </div>
            <button onClick={handleSave} className="btn btn-primary px-5 font-bold shrink-0">
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">

          {/* Sidebar Tabs */}
          <div className="lg:w-52 shrink-0">
            <nav className="card p-2 flex lg:flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left w-full ${
                    activeTab === tab.id
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── Currency & Region ─────────────────────────────────────── */}
            {activeTab === "currency" && (
              <>
                <SectionCard title="Currency & Region" icon="💰">
                  <SettingRow
                    label="Auto-Detect Currency"
                    desc="Detect from your browser's language settings"
                  >
                    <button
                      onClick={handleAutoDetect}
                      className="btn btn-secondary btn-sm font-semibold flex items-center gap-1.5"
                    >
                      🌍 Auto-Detect
                    </button>
                  </SettingRow>
                  <SettingRow
                    label="Compact Numbers"
                    desc="Show ₹1.2L instead of ₹1,20,000 (or $1.2M instead of $1,200,000)"
                  >
                    <ToggleSwitch
                      id="compact-numbers"
                      checked={settings.compactNumbers}
                      onChange={(v) => updateSettings({ compactNumbers: v })}
                    />
                  </SettingRow>
                </SectionCard>

                {/* Currency Picker */}
                <SectionCard title="Select Currency" icon="🏦">
                  <div className="py-3">
                    {/* Search */}
                    <div className="relative mb-4">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search currency..."
                        value={searchCurrency}
                        onChange={(e) => setSearchCurrency(e.target.value)}
                        className="form-input !pl-9 py-2 text-xs w-full rounded-xl"
                      />
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1 pb-3">
                      {filteredCurrencies.map((cur) => (
                        <button
                          key={cur.code}
                          onClick={() => updateSettings({ currencyCode: cur.code })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                            settings.currencyCode === cur.code
                              ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 ring-2 ring-[var(--color-primary)]/30"
                              : "border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-secondary)]"
                          }`}
                        >
                          <span className="text-2xl">{cur.flag}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[var(--color-text-primary)]">{cur.code}</span>
                              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{cur.symbol}</span>
                              {settings.currencyCode === cur.code && (
                                <span className="ml-auto text-[var(--color-primary)] text-xs font-black">✓</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">{cur.name}</p>
                          </div>
                        </button>
                      ))}
                      {filteredCurrencies.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-sm text-[var(--color-text-tertiary)]">
                          No currencies match "{searchCurrency}"
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {/* Live Preview */}
                <SectionCard title="Live Preview" icon="👁️">
                  <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[100, 12500, 125000, 12500000].map((val) => (
                      <div key={val} className="bg-[var(--color-surface-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                        <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1">
                          {val.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm font-black text-[var(--color-primary)]">{format(val)}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── Appearance ─────────────────────────────────────────────── */}
            {activeTab === "appearance" && (
              <>
                <SectionCard title="Theme Preset" icon="🎨">
                  <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          updateSettings({ theme: t.id });
                          localStorage.setItem("debtproof_theme", t.id);
                          const root = document.documentElement;
                          if (t.id === "emerald") {
                            root.style.setProperty("--color-surface", "#064e3b");
                            root.style.setProperty("--color-surface-secondary", "#022c22");
                            root.style.setProperty("--color-surface-tertiary", "#065f46");
                            root.style.setProperty("--color-primary", "#10b981");
                            root.style.setProperty("--color-primary-light", "#34d399");
                            root.style.setProperty("--color-primary-dark", "#6ee7b7");
                            root.style.setProperty("--color-accent", "#34d399");
                            root.style.setProperty("--color-text-primary", "#ecfdf5");
                            root.style.setProperty("--color-text-secondary", "#a7f3d0");
                            root.style.setProperty("--color-border-light", "rgba(52, 211, 153, 0.2)");
                          } else if (t.id === "midnight") {
                            root.style.setProperty("--color-surface", "#1e1b4b");
                            root.style.setProperty("--color-surface-secondary", "#0f172a");
                            root.style.setProperty("--color-surface-tertiary", "#312e81");
                            root.style.setProperty("--color-primary", "#6366f1");
                            root.style.setProperty("--color-primary-light", "#818cf8");
                            root.style.setProperty("--color-primary-dark", "#a5b4fc");
                            root.style.setProperty("--color-accent", "#818cf8");
                            root.style.setProperty("--color-text-primary", "#e0e7ff");
                            root.style.setProperty("--color-text-secondary", "#c7d2fe");
                            root.style.setProperty("--color-border-light", "rgba(129, 140, 248, 0.2)");
                          } else if (t.id === "light") {
                            root.style.setProperty("--color-surface", "#ffffff");
                            root.style.setProperty("--color-surface-secondary", "#f8fafc");
                            root.style.setProperty("--color-surface-tertiary", "#f1f5f9");
                            root.style.setProperty("--color-primary", "#1a3a5c");
                            root.style.setProperty("--color-primary-light", "#2563a8");
                            root.style.setProperty("--color-primary-dark", "#0f2340");
                            root.style.setProperty("--color-accent", "#10b981");
                            root.style.setProperty("--color-text-primary", "#0f172a");
                            root.style.setProperty("--color-text-secondary", "#475569");
                            root.style.setProperty("--color-border-light", "#f1f5f9");
                          } else {
                            root.style.setProperty("--color-surface", "#0f172a");
                            root.style.setProperty("--color-surface-secondary", "#020617");
                            root.style.setProperty("--color-surface-tertiary", "#1e293b");
                            root.style.setProperty("--color-primary", "#38bdf8");
                            root.style.setProperty("--color-primary-light", "#0ea5e9");
                            root.style.setProperty("--color-primary-dark", "#7dd3fc");
                            root.style.setProperty("--color-accent", "#10b981");
                            root.style.setProperty("--color-text-primary", "#f8fafc");
                            root.style.setProperty("--color-text-secondary", "#94a3b8");
                            root.style.setProperty("--color-border-light", "rgba(255, 255, 255, 0.1)");
                          }
                          showToast(`Theme changed to ${t.label}`, "info");
                        }}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                          settings.theme === t.id
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30"
                            : "border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-secondary)]"
                        }`}
                      >
                        {settings.theme === t.id && (
                          <span className="absolute top-2.5 right-2.5 text-[var(--color-primary)] font-black text-sm">✓</span>
                        )}
                        <div className="flex gap-1.5 mb-3">
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ background: t.color }} />
                          <div className="w-5 h-5 rounded-full border border-black/10" style={{ background: t.accent }} />
                        </div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">{t.label}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Display Options" icon="🖥️">
                  <SettingRow
                    label="Date Format"
                    desc="How dates are shown throughout the app"
                  >
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => updateSettings({ dateFormat: e.target.value as typeof settings.dateFormat })}
                      className="form-input text-xs py-1.5 px-3 rounded-lg"
                    >
                      {DATE_FORMATS.map((df) => (
                        <option key={df.value} value={df.value}>{df.label}</option>
                      ))}
                    </select>
                  </SettingRow>
                  <SettingRow
                    label="Compact Numbers"
                    desc="₹1.2L vs ₹1,20,000 / $1.2M vs $1,200,000"
                  >
                    <ToggleSwitch
                      id="compact-numbers-display"
                      checked={settings.compactNumbers}
                      onChange={(v) => updateSettings({ compactNumbers: v })}
                    />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* ── Dashboard Customization ─────────────────────────────────── */}
            {activeTab === "dashboard" && (
              <>
                <SectionCard title="Dashboard Widgets Customization" icon="🎛️">
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium pt-3 pb-2 border-b border-[var(--color-border-light)]">
                    Control which cards, meters, and tools appear on your main Dashboard (`/dashboard`). Turn off any section you don&apos;t need for a cleaner workspace.
                  </p>

                  <SettingRow
                    label="Financial Overview Metric Cards"
                    desc="Show Total Loans, Total Outstanding, Upcoming EMI, and Status cards"
                  >
                    <ToggleSwitch
                      id="widget-overview-cards"
                      checked={settings.dashboardWidgets?.showOverviewCards ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showOverviewCards: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Monthly Income & Outflow Safety Meter"
                    desc="Show Income tracking, monthly commitments, and DTI ratio safety gauge"
                  >
                    <ToggleSwitch
                      id="widget-income-tracker"
                      checked={settings.dashboardWidgets?.showIncomeTracker ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showIncomeTracker: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Individual Loan Repayment Progress"
                    desc="Show progress bars for each active loan with green paid / red remaining breakdown"
                  >
                    <ToggleSwitch
                      id="widget-loan-portfolio"
                      checked={settings.dashboardWidgets?.showLoanPortfolio ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showLoanPortfolio: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Debt Reduction Velocity & Milestones"
                    desc="Show 25%, 50%, 75%, 100% payoff milestone badges"
                  >
                    <ToggleSwitch
                      id="widget-payoff-milestones"
                      checked={settings.dashboardWidgets?.showPayoffMilestones ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showPayoffMilestones: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="AI Financial Payoff Assistant"
                    desc="Show AI advisor widget with automated payoff tips"
                  >
                    <ToggleSwitch
                      id="widget-ai-advisor"
                      checked={settings.dashboardWidgets?.showAiAdvisor ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showAiAdvisor: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Credit Card Utilization Meter"
                    desc="Show 30% recommended credit card limit utilization gauge"
                  >
                    <ToggleSwitch
                      id="widget-credit-utilization"
                      checked={settings.dashboardWidgets?.showCreditUtilization ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showCreditUtilization: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Emergency EMI Buffer Reserve Tracker"
                    desc="Show emergency cushion runway tracker"
                  >
                    <ToggleSwitch
                      id="widget-emergency-buffer"
                      checked={settings.dashboardWidgets?.showEmergencyBuffer ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showEmergencyBuffer: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="EMI Auto-Debits Bank Balance Health"
                    desc="Show 7-day upcoming debit bounce risk checker"
                  >
                    <ToggleSwitch
                      id="widget-bounce-protection"
                      checked={settings.dashboardWidgets?.showEmiBounceProtection ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showEmiBounceProtection: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Multi-Currency Tracker"
                    desc="Show live exchange rates and currency converter widget"
                  >
                    <ToggleSwitch
                      id="widget-multi-currency"
                      checked={settings.dashboardWidgets?.showMultiCurrency ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showMultiCurrency: val },
                        })
                      }
                    />
                  </SettingRow>

                  <SettingRow
                    label="Payoff Accelerator Simulator & Projections"
                    desc="Show Snowball vs Avalanche payoff simulations"
                  >
                    <ToggleSwitch
                      id="widget-projections"
                      checked={settings.dashboardWidgets?.showProjections ?? true}
                      onChange={(val) =>
                        updateSettings({
                          dashboardWidgets: { ...(settings.dashboardWidgets || {}), showProjections: val },
                        })
                      }
                    />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* ── Notifications ──────────────────────────────────────────── */}
            {activeTab === "notifications" && (
              <SectionCard title="Notification Preferences" icon="🔔">
                <SettingRow
                  label="EMI Reminder"
                  desc="Get reminded before EMI due date"
                >
                  <select
                    value={settings.emiReminderDays}
                    onChange={(e) => updateSettings({ emiReminderDays: Number(e.target.value) })}
                    className="form-input text-xs py-1.5 px-3 rounded-lg"
                  >
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                    <option value={3}>3 days before</option>
                    <option value={5}>5 days before</option>
                    <option value={7}>7 days before</option>
                    <option value={0}>Disabled</option>
                  </select>
                </SettingRow>
                <SettingRow
                  label="Overdue Alerts"
                  desc="Alert when a payment is overdue"
                >
                  <ToggleSwitch
                    id="overdue-alerts"
                    checked={settings.overdueAlerts}
                    onChange={(v) => updateSettings({ overdueAlerts: v })}
                  />
                </SettingRow>
                <SettingRow
                  label="Payment Confirmation"
                  desc="Show confirmation after logging a payment"
                >
                  <ToggleSwitch
                    id="payment-confirmation"
                    checked={settings.paymentConfirmation}
                    onChange={(v) => updateSettings({ paymentConfirmation: v })}
                  />
                </SettingRow>
                <div className="py-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                    <span className="text-blue-400 shrink-0 mt-0.5">ℹ️</span>
                    <span>Push notifications require browser permission. These settings control in-app alerts. Browser-level notifications coming in a future update.</span>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ── Privacy & Security ─────────────────────────────────────── */}
            {activeTab === "privacy" && (
              <>
                <SectionCard title="Data & Privacy" icon="🔒">
                  <SettingRow
                    label="Export Settings"
                    desc="Download your app preferences as JSON"
                  >
                    <button onClick={handleExport} className="btn btn-secondary btn-sm font-semibold">
                      📥 Export JSON
                    </button>
                  </SettingRow>
                  <SettingRow
                    label="Clear Local Settings"
                    desc="Reset all preferences to defaults (does not delete account data)"
                  >
                    {showClearConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleClearData}
                          className="btn btn-sm bg-red-600 text-white border-red-600 font-bold"
                        >
                          Confirm Clear
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="btn btn-secondary btn-sm font-semibold text-red-400 hover:text-red-300"
                      >
                        🗑️ Clear Data
                      </button>
                    )}
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Security Info" icon="🛡️">
                  <div className="py-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-400 text-xl">✅</span>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">Settings stored locally</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">Preferences are in your browser's localStorage — not on servers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-400 text-xl">🔐</span>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">Financial data encrypted</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">All loan data is server-side encrypted with JWT auth tokens</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="text-blue-400 text-xl">⛓️</span>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">Blockchain-anchored receipts</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">Payment hashes are immutably stored on Monad Blockchain</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── About ──────────────────────────────────────────────────── */}
            {activeTab === "about" && (
              <SectionCard title="About DebtProof" icon="ℹ️">
                <div className="py-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[var(--color-text-primary)]">DebtProof</h2>
                      <p className="text-xs text-[var(--color-text-tertiary)]">by Sanatan Labs</p>
                      <p className="text-xs font-semibold text-[var(--color-primary)] mt-0.5">Version 2.0 · Global Edition</p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    DebtProof is a global blockchain-powered debt management platform. Track loans in any currency, generate
                    tamper-proof payment receipts on Monad Blockchain, and achieve financial freedom with powerful analytics.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "26+ Currencies", icon: "💱" },
                      { label: "Monad Chain", icon: "⛓️" },
                      { label: "Open Source", icon: "🌐" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[var(--color-surface-secondary)] rounded-xl p-3 text-center border border-[var(--color-border-light)]">
                        <p className="text-xl mb-1">{item.icon}</p>
                        <p className="text-[10px] font-bold text-[var(--color-text-secondary)]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a href="https://github.com/Abhimanyu-Vaishnav/DebtProof" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm font-semibold">
                      GitHub →
                    </a>
                    <a href="/dashboard/help" className="btn btn-ghost btn-sm font-semibold">
                      Help & FAQ →
                    </a>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Save Banner */}
            <div className="flex items-center justify-between bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] rounded-2xl px-5 py-3">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Settings auto-save when you make changes · Stored in your browser
              </p>
              <button onClick={handleSave} className="btn btn-primary btn-sm font-bold">
                ✓ Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
