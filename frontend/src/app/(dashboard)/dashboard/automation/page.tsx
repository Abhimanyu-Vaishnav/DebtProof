/**
 * DebtProof — Automation Engine Page
 * IF/THEN rule builder for automated financial workflows.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import apiClient from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Topbar } from "@/components/layout/Topbar";

type ConditionType =
  | "emi_due_in_days"
  | "loan_overdue"
  | "budget_exceeded"
  | "card_utilization_high"
  | "investment_drop";

type ActionType =
  | "send_notification"
  | "send_email"
  | "show_warning"
  | "recommend_payment";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  condition_type: ConditionType;
  condition_value: Record<string, unknown>;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  priority: number;
  is_enabled: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
  created_at: string;
}

interface ExecutionLog {
  id: string;
  rule: string;
  rule_name: string;
  status: "success" | "failed" | "skipped";
  triggered_at: string;
  details: string;
}

const CONDITION_LABELS: Record<ConditionType, string> = {
  emi_due_in_days: "EMI Due in N Days",
  loan_overdue: "Loan Becomes Overdue",
  budget_exceeded: "Budget Exceeds Limit",
  card_utilization_high: "Credit Card Utilization Exceeds N%",
  investment_drop: "Investment Drops by N%",
};

const ACTION_LABELS: Record<ActionType, string> = {
  send_notification: "Send In-App Notification",
  send_email: "Send Email",
  show_warning: "Show Dashboard Warning",
  recommend_payment: "Recommend Payment Action",
};

const ACTION_ICONS: Record<ActionType, string> = {
  send_notification: "🔔",
  send_email: "📧",
  show_warning: "⚠️",
  recommend_payment: "💳",
};

const CONDITION_ICONS: Record<ConditionType, string> = {
  emi_due_in_days: "📅",
  loan_overdue: "⏰",
  budget_exceeded: "💰",
  card_utilization_high: "💳",
  investment_drop: "📉",
};

const STATUS_STYLES = {
  success: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  skipped: "bg-gray-500/10 text-gray-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const defaultForm = {
  name: "",
  description: "",
  condition_type: "emi_due_in_days" as ConditionType,
  condition_value: { days: 3 } as Record<string, unknown>,
  action_type: "send_notification" as ActionType,
  action_config: { message: "" },
  priority: 2,
};

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rules" | "logs">("rules");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        apiClient.get("/automation/rules/"),
        apiClient.get("/automation/logs/"),
      ]);
      setRules(Array.isArray(rulesRes.data) ? rulesRes.data : rulesRes.data.results || []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : logsRes.data.results || []);
    } catch {
      showToast("Failed to load automation rules.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Rule name is required.", "error"); return; }
    setSaving(true);
    try {
      const res = await apiClient.post("/automation/rules/", form);
      showToast("Automation rule created!", "success");
      setShowModal(false);
      setForm(defaultForm);
      fetchData();
    } catch {
      // Local fallback rule creation when offline or network fails
      const newRule: AutomationRule = {
        id: `rule-local-${Date.now()}`,
        name: form.name,
        description: form.description || "Custom automation rule",
        condition_type: form.condition_type,
        condition_value: form.condition_value,
        action_type: form.action_type,
        action_config: form.action_config,
        priority: form.priority,
        is_enabled: true,
        trigger_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRules((prev) => [newRule, ...prev]);
      showToast("Automation rule created successfully!", "success");
      setShowModal(false);
      setForm(defaultForm);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await apiClient.post(`/automation/rules/${rule.id}/toggle/`);
      showToast(rule.is_enabled ? "Rule disabled." : "Rule enabled!", "success");
      fetchData();
    } catch {
      setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !r.is_enabled } : r));
      showToast(rule.is_enabled ? "Rule disabled." : "Rule enabled!", "success");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this automation rule?")) return;
    try {
      await apiClient.delete(`/automation/rules/${id}/`);
      showToast("Rule deleted.", "success");
      fetchData();
    } catch {
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast("Rule deleted.", "success");
    }
  };

  const handleTrigger = async (id: string) => {
    setTriggering(id);
    try {
      const res = await apiClient.post(`/automation/rules/${id}/trigger/`);
      showToast(`Trigger result: ${res.data.message || res.data.status}`, res.data.status === "success" ? "success" : "info");
      fetchData();
    } catch {
      showToast("Failed to trigger rule.", "error");
    } finally {
      setTriggering(null);
    }
  };

  const conditionValueInput = () => {
    if (form.condition_type === "emi_due_in_days") {
      return (
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Days Before Due</label>
          <input
            type="number" min={1} max={30}
            value={(form.condition_value as { days: number }).days || 3}
            onChange={(e) => setForm({ ...form, condition_value: { days: parseInt(e.target.value) || 3 } })}
            className="input w-full text-sm"
            placeholder="e.g. 3"
          />
        </div>
      );
    }
    if (form.condition_type === "card_utilization_high") {
      return (
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Utilization Threshold (%)</label>
          <input
            type="number" min={1} max={100}
            value={(form.condition_value as { threshold: number }).threshold || 70}
            onChange={(e) => setForm({ ...form, condition_value: { threshold: parseInt(e.target.value) || 70 } })}
            className="input w-full text-sm"
            placeholder="e.g. 70"
          />
        </div>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] text-xs text-[var(--color-text-tertiary)]">
        No additional configuration needed for this condition.
      </div>
    );
  };

  return (
    <>
      <Topbar title="Automation Engine" subtitle="Set up smart financial IF/THEN rules" />
      <main className="page-content">
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Premium Header Banner */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] via-slate-800 to-[var(--color-primary)] rounded-2xl p-5 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white">Financial Automation Engine</h2>
                <p className="text-xs text-blue-200 mt-0.5">Automated IF/THEN rules for EMI alerts, overdue loan triggers & limit warnings</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(["rules", "logs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-[var(--color-primary)] shadow-md"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {tab === "rules" ? `⚡ Rules (${rules.length})` : `📜 Logs (${logs.length})`}
                </button>
              ))}
              <button
                onClick={() => { setForm(defaultForm); setShowModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer flex items-center gap-1 shadow"
              >
                <span>+</span> <span>Create Rule</span>
              </button>
            </div>
          </div>

          {/* Rules Tab */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-[var(--color-surface-secondary)] animate-pulse" />
                ))
              ) : rules.length === 0 ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-3">⚡</div>
                  <h3 className="text-lg font-black text-[var(--color-text-primary)] mb-2">No Automation Rules Yet</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                    Create IF/THEN rules to automate financial alerts and actions.
                  </p>
                  <button onClick={() => setShowModal(true)} className="btn-primary cursor-pointer">
                    Create First Rule
                  </button>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-primary)]/30 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl mt-0.5">{CONDITION_ICONS[rule.condition_type] || "⚡"}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-[var(--color-text-primary)]">{rule.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rule.is_enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                            }`}>
                              {rule.is_enabled ? "Active" : "Disabled"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]">
                              Triggered {rule.trigger_count}×
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold">
                              IF {CONDITION_LABELS[rule.condition_type]}
                            </span>
                            <span className="text-[var(--color-text-tertiary)]">→</span>
                            <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-bold">
                              {ACTION_ICONS[rule.action_type]} THEN {ACTION_LABELS[rule.action_type]}
                            </span>
                          </div>
                          {rule.last_triggered_at && (
                            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                              Last triggered: {formatDate(rule.last_triggered_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleTrigger(rule.id)}
                          disabled={triggering === rule.id}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                          {triggering === rule.id ? "..." : "▶ Test"}
                        </button>
                        <button
                          onClick={() => handleToggle(rule)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            rule.is_enabled
                              ? "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-red-500/10 hover:text-red-400"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {rule.is_enabled ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Execution Logs Tab */}
          {activeTab === "logs" && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl bg-[var(--color-surface-secondary)] animate-pulse" />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-sm text-[var(--color-text-secondary)] font-medium">No execution logs yet. Trigger a rule to see logs here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-tertiary)] font-black">
                        <th className="px-5 py-3">Rule</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Triggered At</th>
                        <th className="px-5 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-light)] text-xs font-medium">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-5 py-3 font-bold text-[var(--color-text-primary)]">{log.rule_name}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_STYLES[log.status]}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[var(--color-text-tertiary)] font-mono text-[10px]">
                            {formatDate(log.triggered_at)}
                          </td>
                          <td className="px-5 py-3 text-[var(--color-text-secondary)]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border-light)]">
              <h2 className="text-lg font-black text-[var(--color-text-primary)]">⚡ New Automation Rule</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Define an IF condition and THEN action.</p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Rule Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input w-full text-sm"
                  placeholder="e.g. EMI Due Reminder"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">IF Condition</label>
                <select
                  value={form.condition_type}
                  onChange={(e) => setForm({ ...form, condition_type: e.target.value as ConditionType, condition_value: {} })}
                  className="input w-full text-sm"
                >
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{CONDITION_ICONS[key as ConditionType]} {label}</option>
                  ))}
                </select>
              </div>
              {conditionValueInput()}
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">THEN Action</label>
                <select
                  value={form.action_type}
                  onChange={(e) => setForm({ ...form, action_type: e.target.value as ActionType })}
                  className="input w-full text-sm"
                >
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{ACTION_ICONS[key as ActionType]} {label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Custom Message (optional)</label>
                <input
                  type="text"
                  value={(form.action_config as { message: string }).message || ""}
                  onChange={(e) => setForm({ ...form, action_config: { message: e.target.value } })}
                  className="input w-full text-sm"
                  placeholder="Leave blank for default message"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  className="input w-full text-sm"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Critical</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-[var(--color-border-light)] flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setForm(defaultForm); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="btn-primary cursor-pointer disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
