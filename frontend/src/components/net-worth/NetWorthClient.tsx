"use client";

import React, { useEffect, useState } from "react";
import { assetsService, AssetFormData, LiabilityFormData } from "@/services/assets.service";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Asset, Liability, NetWorthSummary, AssetType, LiabilityType } from "@/types";
import {
  ASSET_TYPE_LABELS,
  LIABILITY_TYPE_LABELS,
} from "@/types";
import { MoneyGivenModal } from "./MoneyGivenModal";

// ── Icon helpers ──────────────────────────────────────────────────────────────
function AssetIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    cash: <span>💵</span>,
    bank: <span>🏦</span>,
    fd: <span>📋</span>,
    rd: <span>🔄</span>,
    investment: <span>📈</span>,
    stocks: <span>📊</span>,
    crypto: <span>🪙</span>,
    receivable: <span>📨</span>,
    loan_given_short: <span>🤝</span>,
    loan_given_long: <span>🏛️</span>,
    p2p_given: <span>🌐</span>,
    real_estate: <span>🏠</span>,
    gold: <span>🥇</span>,
    business: <span>🏢</span>,
    vehicle: <span>🚗</span>,
    other: <span>📦</span>,
  };
  return <span className="text-xl">{icons[type] ?? icons.other}</span>;
}

function LiabilityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    bill: <span>📄</span>,
    rent: <span>🏠</span>,
    tax: <span>🏛️</span>,
    personal_debt: <span>🤝</span>,
    active_loans: <span>🏦</span>,
    credit_cards: <span>💳</span>,
    other: <span>⚡</span>,
  };
  return <span className="text-xl">{icons[type] ?? icons.other}</span>;
}

// ── Reusable row component ────────────────────────────────────────────────────
interface ItemRowProps {
  name: string;
  sublabel: string;
  badge: string;
  badgeColor: string;
  value: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onClickDetail?: () => void;
  icon: React.ReactNode;
}

function ItemRow({ name, sublabel, badge, badgeColor, value, onEdit, onDelete, onClickDetail, icon }: ItemRowProps) {
  const { format } = useCurrency();
  return (
    <div 
      onClick={onClickDetail}
      className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all cursor-pointer group shadow-xs"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border)] shadow-xs">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors truncate">{name}</p>
        <p className="text-[10px] text-[var(--color-text-tertiary)] font-medium mt-0.5">{sublabel}</p>
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full hidden sm:block ${badgeColor}`}>
        {badge}
      </span>
      <p className="text-sm font-black text-[var(--color-text-primary)] ml-2">{format(value)}</p>
      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
        {onEdit && (
          <button onClick={onEdit} className="text-[10px] font-bold text-blue-400 hover:underline px-1">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="text-[10px] font-bold text-red-400 hover:underline px-1">
            Del
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  total: number;
  color: string;
  badge?: string;
  onAdd?: () => void;
}

function SectionHeader({ title, total, color, badge, onAdd }: SectionHeaderProps) {
  const { format } = useCurrency();
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${color} shadow-xs`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">{title}</span>
        {badge && (
          <span className="text-[9px] uppercase bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full font-bold">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black text-[var(--color-text-primary)]">{format(total)}</span>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center hover:opacity-90 transition-all shadow-xs"
            title="Add Item"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

// ── Asset/Liability Form Modal ─────────────────────────────────────────────────
interface FormModalProps {
  mode: "asset" | "liability";
  isOpen: boolean;
  editing: Asset | Liability | null;
  onClose: () => void;
  onSubmit: (data: AssetFormData | LiabilityFormData) => void;
}

function FormModal({ mode, isOpen, editing, onClose, onSubmit }: FormModalProps) {
  const isAsset = mode === "asset";
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setValue(editing.value);
      setType(isAsset ? (editing as Asset).asset_type : (editing as Liability).liability_type);
    } else {
      setName("");
      setValue("");
      setType(isAsset ? "bank" : "personal_debt");
    }
  }, [editing, isAsset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;
    if (isAsset) {
      onSubmit({ name, value, asset_type: type as AssetType });
    } else {
      onSubmit({ name, value, liability_type: type as LiabilityType });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            {editing ? `Edit ${isAsset ? "Asset" : "Liability"}` : `Add New ${isAsset ? "Asset" : "Liability"}`}
          </h3>
          <button onClick={onClose} className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
              {isAsset ? "Asset Name" : "Liability Name"}
            </label>
            <input
              type="text"
              placeholder={isAsset ? "e.g. HDFC Fixed Deposit" : "e.g. Personal Debt to Friend"}
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">Category Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {isAsset ? (
                  <>
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="fd">Fixed Deposit (FD)</option>
                    <option value="rd">Recurring Deposit (RD)</option>
                    <option value="investment">Mutual Funds / Stocks</option>
                    <option value="crypto">Crypto Asset</option>
                    <option value="receivable">Loan Given / Receivable</option>
                    <option value="real_estate">Real Estate / Property</option>
                    <option value="gold">Gold & Jewels</option>
                    <option value="business">Business Equity</option>
                    <option value="vehicle">Vehicle Asset</option>
                    <option value="other">Other Asset</option>
                  </>
                ) : (
                  <>
                    <option value="personal_debt">Personal Debt / Borrowed</option>
                    <option value="bill">Unpaid Bill / Dues</option>
                    <option value="rent">Rent Due</option>
                    <option value="tax">Tax Payable</option>
                    <option value="other">Other Liability</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">Valuation Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                required
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
            >
              Save {isAsset ? "Asset" : "Liability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function NetWorthClient() {
  const { format } = useCurrency();
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalMode, setModalMode] = useState<"asset" | "liability">("asset");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(null);
  const [moneyGivenOpen, setMoneyGivenOpen] = useState(false);

  // Detail Drawer State
  const [detailItem, setDetailItem] = useState<{
    name: string;
    type: string;
    category: string;
    value: number;
    isAsset: boolean;
    notes?: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, assetData, liabData] = await Promise.all([
        assetsService.getNetWorth(),
        assetsService.getAssets(),
        assetsService.getLiabilities(),
      ]);
      setSummary(sumData);
      setAssets(assetData);
      setLiabilities(liabData);
    } catch {
      setError("Failed to load net worth data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode: "asset" | "liability", item?: Asset | Liability) => {
    setModalMode(mode);
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: AssetFormData | LiabilityFormData) => {
    try {
      setLoading(true);
      if (modalMode === "asset") {
        if (editingItem) {
          await assetsService.updateAsset(editingItem.id, data as AssetFormData);
        } else {
          await assetsService.createAsset(data as AssetFormData);
        }
      } else {
        if (editingItem) {
          await assetsService.updateLiability(editingItem.id, data as LiabilityFormData);
        } else {
          await assetsService.createLiability(data as LiabilityFormData);
        }
      }
      setIsModalOpen(false);
      await fetchData();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (mode: "asset" | "liability", id: string) => {
    if (!confirm(`Delete this ${mode}?`)) return;
    setLoading(true);
    if (mode === "asset") await assetsService.deleteAsset(id);
    else await assetsService.deleteLiability(id);
    await fetchData();
  };

  if (loading && !summary) {
    return <LoadingSpinner size="md" label="Calculating real-time net worth & solvency metrics..." />;
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--color-error)] mb-3">{error}</p>
        <button className="btn btn-primary btn-sm" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  const s = summary!;
  const netWorthColor = s.net_worth >= 0 ? "text-emerald-400" : "text-rose-400";
  const assetRatio = (s.total_assets + s.total_liabilities) > 0
    ? (s.total_assets / (s.total_assets + s.total_liabilities)) * 100
    : 50;

  // Solvency Multiplier (Assets / Liabilities)
  const solvencyRatio = s.total_liabilities > 0 ? (s.total_assets / s.total_liabilities) : (s.total_assets > 0 ? 10 : 1);

  // Split assets by class
  const currentAssets = assets.filter(a => a.asset_class === "current");
  const fixedAssets = assets.filter(a => a.asset_class === "fixed");
  // Split custom liabilities by class
  const shortTermLiabs = liabilities.filter(l => l.liability_class === "short_term");
  const longTermLiabs = liabilities.filter(l => l.liability_class === "long_term");

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Executive Banner ────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
            <span>🏛️</span> Wealth & Solvency Balance Sheet
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Real-time balance sheet tracking your Liquid Assets, Real Estate, Business Capital vs Active Liabilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setMoneyGivenOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🤝</span> Record Money Lent
          </button>
          <button
            onClick={() => openModal("asset")}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Asset
          </button>
          <button
            onClick={() => openModal("liability")}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Liability
          </button>
        </div>
      </div>

      {/* ── Hero Net Worth Dashboard Deck ────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Net Worth Executive Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Net Worth</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                {solvencyRatio >= 2 ? "🟢 Grade A+ Solvency" : solvencyRatio >= 1 ? "🟡 Grade B Solvency" : "🔴 Overleveraged"}
              </span>
            </div>
            <h2 className={`text-4xl font-black mt-3 ${s.net_worth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {format(s.net_worth)}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2">
              Calculated as Total Assets ({format(s.total_assets)}) − Total Liabilities ({format(s.total_liabilities)}).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)] font-semibold">Solvency Cover Multiplier</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{solvencyRatio.toFixed(1)}x Cover</span>
          </div>
        </div>

        {/* Total Assets Breakdown Card */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Total Assets Portfolio</span>
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">{assets.length} Holdings</span>
            </div>
            <h3 className="text-3xl font-black text-blue-700 dark:text-blue-400 mt-3">{format(s.total_assets)}</h3>
          </div>

          <div className="space-y-2 mt-6 pt-4 border-t border-[var(--color-border)] text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Liquid Current Assets:
              </span>
              <strong className="text-[var(--color-text-primary)] font-bold">{format(s.current_assets)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Fixed Assets & Property:
              </span>
              <strong className="text-[var(--color-text-primary)] font-bold">{format(s.fixed_assets)}</strong>
            </div>
          </div>
        </div>

        {/* Total Liabilities Breakdown Card */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Total Liabilities & Debts</span>
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">{liabilities.length + s.liability_distribution.length} Obligations</span>
            </div>
            <h3 className="text-3xl font-black text-rose-700 dark:text-rose-400 mt-3">{format(s.total_liabilities)}</h3>
          </div>

          <div className="space-y-2 mt-6 pt-4 border-t border-[var(--color-border)] text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Short-term Dues:
              </span>
              <strong className="text-[var(--color-text-primary)] font-bold">{format(s.short_term_liabilities)}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Long-term Bank Loans:
              </span>
              <strong className="text-[var(--color-text-primary)] font-bold">{format(s.long_term_liabilities)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── Asset-to-Liability Ratio Bar ────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <span>📈</span> Total Assets ({assetRatio.toFixed(1)}%)
          </span>
          <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <span>📉</span> Total Liabilities ({(100 - assetRatio).toFixed(1)}%)
          </span>
        </div>
        <div className="h-3.5 rounded-xl bg-[var(--color-surface-tertiary)] overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700" style={{ width: `${assetRatio}%` }} />
          <div className="h-full bg-gradient-to-r from-rose-600 to-orange-500 transition-all duration-700 flex-1" />
        </div>
      </div>

      {/* ── Full Side-by-Side Balance Sheet Deck ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── ASSETS COLUMN ─────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <span>💼</span> Asset Portfolio ({assets.length})
            </h2>
            <button
              onClick={() => openModal("asset")}
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Add Asset
            </button>
          </div>

          {/* Current Assets */}
          <SectionHeader
            title="Current / Liquid Assets"
            total={s.current_assets}
            color="border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300"
            badge="Liquid"
            onAdd={() => openModal("asset")}
          />
          <div className="space-y-2">
            {currentAssets.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] pl-2 py-3 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)] text-center">
                No current assets. Click &quot;+ Add Asset&quot; to track Cash, Bank, FDs, etc.
              </p>
            ) : (
              currentAssets.map(a => (
                <ItemRow
                  key={a.id}
                  icon={<AssetIcon type={a.asset_type} />}
                  name={a.name}
                  sublabel={ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  badge="Liquid"
                  badgeColor="bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/20"
                  value={parseFloat(a.value)}
                  onClickDetail={() => setDetailItem({
                    name: a.name,
                    type: ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type,
                    category: "Current / Liquid Asset",
                    value: parseFloat(a.value),
                    isAsset: true,
                    notes: "Liquid current asset holding."
                  })}
                  onEdit={() => openModal("asset", a)}
                  onDelete={() => handleDelete("asset", a.id)}
                />
              ))
            )}
          </div>

          {/* Fixed Assets */}
          <SectionHeader
            title="Fixed Assets & Property"
            total={s.fixed_assets}
            color="border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300"
            badge="Long-term"
            onAdd={() => openModal("asset")}
          />
          <div className="space-y-2">
            {fixedAssets.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] pl-2 py-3 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)] text-center">
                No fixed assets. Track Real Estate, Gold, Business, or Vehicles.
              </p>
            ) : (
              fixedAssets.map(a => (
                <ItemRow
                  key={a.id}
                  icon={<AssetIcon type={a.asset_type} />}
                  name={a.name}
                  sublabel={ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  badge="Fixed"
                  badgeColor="bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20"
                  value={parseFloat(a.value)}
                  onClickDetail={() => setDetailItem({
                    name: a.name,
                    type: ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type,
                    category: "Fixed Asset & Property",
                    value: parseFloat(a.value),
                    isAsset: true,
                    notes: "Long term fixed asset or real estate investment."
                  })}
                  onEdit={() => openModal("asset", a)}
                  onDelete={() => handleDelete("asset", a.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── LIABILITIES COLUMN ────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <span>💳</span> Liabilities Portfolio ({liabilities.length + s.liability_distribution.length})
            </h2>
            <button
              onClick={() => openModal("liability")}
              className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Add Liability
            </button>
          </div>

          {/* Short-Term Liabilities */}
          <SectionHeader
            title="Short-term Liabilities"
            total={s.short_term_liabilities}
            color="border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-300"
            badge="Due Soon"
            onAdd={() => openModal("liability")}
          />
          <div className="space-y-2">
            {s.liability_distribution
              .filter(d => d.liability_type === "credit_cards")
              .map(d => (
                <ItemRow
                  key="credit_cards"
                  icon={<LiabilityIcon type="credit_cards" />}
                  name="Credit Cards Outstanding"
                  sublabel={`${d.count} active card(s) — managed in Credit Cards section`}
                  badge="Short-term"
                  badgeColor="bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/20"
                  value={d.value}
                  onClickDetail={() => setDetailItem({
                    name: "Credit Cards Outstanding",
                    type: "Credit Card Debt",
                    category: "Short-term Liability",
                    value: d.value,
                    isAsset: false,
                    notes: `${d.count} active credit card(s) total outstanding balance.`
                  })}
                />
              ))}
            {shortTermLiabs.map(l => (
              <ItemRow
                key={l.id}
                icon={<LiabilityIcon type={l.liability_type} />}
                name={l.name}
                sublabel={LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type}
                badge="Short-term"
                badgeColor="bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/20"
                value={parseFloat(l.value)}
                onClickDetail={() => setDetailItem({
                  name: l.name,
                  type: LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type,
                  category: "Short-term Liability",
                  value: parseFloat(l.value),
                  isAsset: false,
                  notes: "Short-term obligation due soon."
                })}
                onEdit={() => openModal("liability", l)}
                onDelete={() => handleDelete("liability", l.id)}
              />
            ))}
            {shortTermLiabs.length === 0 && s.liability_distribution.filter(d => d.liability_type === "credit_cards").length === 0 && (
              <p className="text-xs text-[var(--color-text-secondary)] pl-2 py-3 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)] text-center">
                No short-term liabilities tracked.
              </p>
            )}
          </div>

          {/* Long-Term Liabilities */}
          <SectionHeader
            title="Long-term Liabilities"
            total={s.long_term_liabilities}
            color="border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
            badge="Loans & Debt"
            onAdd={() => openModal("liability")}
          />
          <div className="space-y-2">
            {s.liability_distribution
              .filter(d => d.liability_type === "active_loans")
              .map(d => (
                <ItemRow
                  key="active_loans"
                  icon={<LiabilityIcon type="active_loans" />}
                  name="Active Loans Total Outstanding"
                  sublabel={`${d.count} active loan(s) — managed in Loans section`}
                  badge="Long-term"
                  badgeColor="bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                  value={d.value}
                  onClickDetail={() => setDetailItem({
                    name: "Active Loans Outstanding",
                    type: "Bank & Personal Loans",
                    category: "Long-term Liability",
                    value: d.value,
                    isAsset: false,
                    notes: `Combined outstanding balance across ${d.count} active loan contract(s).`
                  })}
                />
              ))}
            {longTermLiabs.map(l => (
              <ItemRow
                key={l.id}
                icon={<LiabilityIcon type={l.liability_type} />}
                name={l.name}
                sublabel={LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type}
                badge="Long-term"
                badgeColor="bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                value={parseFloat(l.value)}
                onClickDetail={() => setDetailItem({
                  name: l.name,
                  type: LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type,
                  category: "Long-term Liability",
                  value: parseFloat(l.value),
                  isAsset: false,
                  notes: "Long-term debt or personal loan taken."
                })}
                onEdit={() => openModal("liability", l)}
                onDelete={() => handleDelete("liability", l.id)}
              />
            ))}
            {longTermLiabs.length === 0 && s.liability_distribution.filter(d => d.liability_type === "active_loans").length === 0 && (
              <p className="text-xs text-[var(--color-text-secondary)] pl-2 py-3 bg-[var(--color-surface)] rounded-xl border border-dashed border-[var(--color-border)] text-center">
                No long-term liabilities tracked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Form Modal ────────────────────────────────── */}
      <FormModal
        mode={modalMode}
        isOpen={isModalOpen}
        editing={editingItem}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* ── Money Given P2P Modal ────────────────────── */}
      <MoneyGivenModal
        isOpen={moneyGivenOpen}
        onClose={() => setMoneyGivenOpen(false)}
        onSubmit={async (data) => {
          try {
            await assetsService.createAsset({
              name: data.name,
              asset_type: data.asset_type,
              value: data.value,
            });
            setMoneyGivenOpen(false);
            fetchData();
          } catch {
            /* ignore */
          }
        }}
      />

      {/* ── Detail Drawer Modal ───────────────────────── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  detailItem.isAsset ? "bg-blue-500/20 text-blue-400" : "bg-rose-500/20 text-rose-400"
                }`}>
                  {detailItem.category}
                </span>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mt-1">
                  {detailItem.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex justify-between items-center">
                <span className="text-[var(--color-text-tertiary)] font-bold">Valuation Amount:</span>
                <span className={`text-xl font-black ${detailItem.isAsset ? "text-blue-400" : "text-rose-400"}`}>
                  {format(detailItem.value)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-surface-tertiary)] space-y-1">
                <span className="text-[var(--color-text-tertiary)] font-semibold block">Subtype / Category:</span>
                <strong className="text-sm font-semibold text-[var(--color-text-primary)] block">
                  {detailItem.type}
                </strong>
              </div>

              {detailItem.notes && (
                <div className="p-3 rounded-xl bg-[var(--color-surface-tertiary)] space-y-1">
                  <span className="text-[var(--color-text-tertiary)] font-semibold block">Description & Notes:</span>
                  <p className="text-[var(--color-text-primary)]">
                    {detailItem.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-5 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-border)] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
