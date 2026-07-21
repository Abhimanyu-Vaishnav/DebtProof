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
  LIABILITY_CLASS_LABELS,
  ASSET_CLASS_LABELS,
} from "@/types";

// ── Icon helpers ──────────────────────────────────────────────────────────────
function AssetIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    cash: <span>💵</span>,
    bank: <span>🏦</span>,
    fd: <span>📋</span>,
    rd: <span>🔄</span>,
    investment: <span>📈</span>,
    receivable: <span>📨</span>,
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
  icon: React.ReactNode;
}

function ItemRow({ name, sublabel, badge, badgeColor, value, onEdit, onDelete, icon }: ItemRowProps) {
  const { format } = useCurrency();
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-secondary)] border border-transparent hover:border-[var(--color-border-light)] transition-all group">
      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{name}</p>
        <p className="text-[10px] text-[var(--color-text-tertiary)]">{sublabel}</p>
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full hidden sm:block ${badgeColor}`}>
        {badge}
      </span>
      <p className="text-sm font-bold text-[var(--color-text-primary)] ml-2">{format(value)}</p>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="text-[10px] font-bold text-[var(--color-primary-light)] hover:underline px-1">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-[10px] font-bold text-[var(--color-error)] hover:underline px-1">
              Del
            </button>
          )}
        </div>
      )}
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
    <div className={`flex items-center justify-between px-4 py-2 rounded-lg border-l-4 ${color}`}>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">{title}</span>
        {badge && (
          <span className="ml-2 text-[9px] uppercase bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[var(--color-text-primary)]">{format(total)}</span>
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
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
  const [name, setName] = useState("");
  const [type, setType] = useState(mode === "asset" ? "cash" : "bill");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setType(mode === "asset" ? (editing as Asset).asset_type : (editing as Liability).liability_type);
      setValue(editing.value);
    } else {
      setName("");
      setType(mode === "asset" ? "cash" : "bill");
      setValue("");
    }
    setError(null);
  }, [editing, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Name is required."); return; }
    const valNum = parseFloat(value);
    if (isNaN(valNum) || valNum <= 0) { setError("Value must be greater than zero."); return; }
    if (mode === "asset") {
      onSubmit({ name: name.trim(), asset_type: type, value: valNum.toFixed(2) });
    } else {
      onSubmit({ name: name.trim(), liability_type: type, value: valNum.toFixed(2) });
    }
  };

  const isAsset = mode === "asset";
  const typeLabels = isAsset ? ASSET_TYPE_LABELS : LIABILITY_TYPE_LABELS;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-5">
          {editing ? "Edit" : "Add"} {isAsset ? "Asset" : "Liability"}
        </h3>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder={isAsset ? "e.g. HDFC Bank Account, SBI FD, Gold Bar" : "e.g. Monthly Rent, Electricity Bill"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Type</label>
              <select className="input w-full h-10 py-1" value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(typeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Value (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input w-full"
                placeholder="0.00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-3 flex items-center justify-end gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-sm ${isAsset ? "btn-primary" : "bg-rose-600 hover:bg-rose-700 text-white"}`}>
              {editing ? "Update" : "Save"}
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<"asset" | "liability">("asset");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(null);

  const fetchData = async () => {
    try {
      const [a, l, s] = await Promise.all([
        assetsService.getAssets(),
        assetsService.getLiabilities(),
        assetsService.getNetWorth(),
      ]);
      setAssets(a);
      setLiabilities(l);
      setSummary(s);
      setError(null);
    } catch {
      setError("Failed to load balance sheet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (mode: "asset" | "liability", item: Asset | Liability | null = null) => {
    setModalMode(mode);
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: AssetFormData | LiabilityFormData) => {
    try {
      if (modalMode === "asset") {
        if (editingItem) await assetsService.updateAsset(editingItem.id, data as AssetFormData);
        else await assetsService.createAsset(data as AssetFormData);
      } else {
        if (editingItem) await assetsService.updateLiability(editingItem.id, data as LiabilityFormData);
        else await assetsService.createLiability(data as LiabilityFormData);
      }
      setModalOpen(false);
      setLoading(true);
      await fetchData();
    } catch {
      /* error is displayed inside modal */
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
    return <LoadingSpinner size="md" label="Loading balance sheet..." />;
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
  const netWorthColor = s.net_worth >= 0 ? "text-emerald-500" : "text-rose-500";
  const assetRatio = (s.total_assets + s.total_liabilities) > 0
    ? (s.total_assets / (s.total_assets + s.total_liabilities)) * 100
    : 50;

  // Split assets by class
  const currentAssets = assets.filter(a => a.asset_class === "current");
  const fixedAssets = assets.filter(a => a.asset_class === "fixed");
  // Split custom liabilities by class
  const shortTermLiabs = liabilities.filter(l => l.liability_class === "short_term");
  const longTermLiabs = liabilities.filter(l => l.liability_class === "long_term");

  return (
    <div className="space-y-6">

      {/* ── Summary Row ────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth */}
        <div className="card p-5 flex flex-col justify-between border-l-4 border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-secondary)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Actual Net Worth</p>
          <h2 className={`text-3xl font-extrabold mt-2 ${netWorthColor}`}>{format(s.net_worth)}</h2>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">Assets − All Liabilities (Loans + Custom)</p>
        </div>
        {/* Total Assets */}
        <div className="card p-5 border-l-4 border-blue-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Assets</p>
          <h3 className="text-2xl font-bold text-blue-500 mt-2">{format(s.total_assets)}</h3>
          <div className="flex gap-3 mt-3 text-[10px]">
            <span className="text-[var(--color-text-tertiary)]">Current: <b className="text-[var(--color-text-primary)]">{format(s.current_assets)}</b></span>
            <span className="text-[var(--color-text-tertiary)]">Fixed: <b className="text-[var(--color-text-primary)]">{format(s.fixed_assets)}</b></span>
          </div>
        </div>
        {/* Total Liabilities */}
        <div className="card p-5 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Liabilities</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-2">{format(s.total_liabilities)}</h3>
          <div className="flex gap-3 mt-3 text-[10px]">
            <span className="text-[var(--color-text-tertiary)]">Short-term: <b className="text-[var(--color-text-primary)]">{format(s.short_term_liabilities)}</b></span>
            <span className="text-[var(--color-text-tertiary)]">Long-term: <b className="text-[var(--color-text-primary)]">{format(s.long_term_liabilities)}</b></span>
          </div>
        </div>
      </section>

      {/* ── Balance Bar ────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold">
          <span className="text-blue-500">Assets ({assetRatio.toFixed(0)}%)</span>
          <span className="text-rose-500">Liabilities ({(100 - assetRatio).toFixed(0)}%)</span>
        </div>
        <div className="h-3 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden flex">
          <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${assetRatio}%` }} />
          <div className="h-full bg-rose-500 transition-all duration-700 flex-1" />
        </div>
      </div>

      {/* ── Full Balance Sheet ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── ASSETS COLUMN ─────────────── */}
        <div className="space-y-4">
          {/* Current Assets */}
          <SectionHeader
            title="Current Assets"
            total={s.current_assets}
            color="border-blue-400 bg-blue-500/5"
            badge="Liquid"
            onAdd={() => openModal("asset")}
          />
          <div className="space-y-2">
            {currentAssets.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] pl-2 py-2">No current assets. Add Cash, Bank, FD, RD, etc.</p>
            ) : (
              currentAssets.map(a => (
                <ItemRow
                  key={a.id}
                  icon={<AssetIcon type={a.asset_type} />}
                  name={a.name}
                  sublabel={ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  badge="Current"
                  badgeColor="bg-blue-500/10 text-blue-500"
                  value={parseFloat(a.value)}
                  onEdit={() => openModal("asset", a)}
                  onDelete={() => handleDelete("asset", a.id)}
                />
              ))
            )}
          </div>

          {/* Fixed Assets */}
          <SectionHeader
            title="Fixed Assets"
            total={s.fixed_assets}
            color="border-indigo-400 bg-indigo-500/5"
            badge="Long-term"
            onAdd={() => openModal("asset")}
          />
          <div className="space-y-2">
            {fixedAssets.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] pl-2 py-2">No fixed assets. Add Real Estate, Gold, Business, etc.</p>
            ) : (
              fixedAssets.map(a => (
                <ItemRow
                  key={a.id}
                  icon={<AssetIcon type={a.asset_type} />}
                  name={a.name}
                  sublabel={ASSET_TYPE_LABELS[a.asset_type] ?? a.asset_type}
                  badge="Fixed"
                  badgeColor="bg-indigo-500/10 text-indigo-500"
                  value={parseFloat(a.value)}
                  onEdit={() => openModal("asset", a)}
                  onDelete={() => handleDelete("asset", a.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── LIABILITIES COLUMN ────────── */}
        <div className="space-y-4">
          {/* Short-Term */}
          <SectionHeader
            title="Short-term Liabilities"
            total={s.short_term_liabilities}
            color="border-orange-400 bg-orange-500/5"
            badge="Due Soon"
            onAdd={() => openModal("liability")}
          />
          <div className="space-y-2">
            {/* Credit Cards from distribution */}
            {s.liability_distribution
              .filter(d => d.liability_type === "credit_cards")
              .map(d => (
                <ItemRow
                  key="credit_cards"
                  icon={<LiabilityIcon type="credit_cards" />}
                  name="Credit Cards Outstanding"
                  sublabel={`${d.count} active card(s) — managed in Credit Cards section`}
                  badge="Short-term"
                  badgeColor="bg-orange-500/10 text-orange-500"
                  value={d.value}
                />
              ))}
            {shortTermLiabs.map(l => (
              <ItemRow
                key={l.id}
                icon={<LiabilityIcon type={l.liability_type} />}
                name={l.name}
                sublabel={LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type}
                badge="Short-term"
                badgeColor="bg-orange-500/10 text-orange-500"
                value={parseFloat(l.value)}
                onEdit={() => openModal("liability", l)}
                onDelete={() => handleDelete("liability", l.id)}
              />
            ))}
            {shortTermLiabs.length === 0 && s.liability_distribution.filter(d => d.liability_type === "credit_cards").length === 0 && (
              <p className="text-xs text-[var(--color-text-tertiary)] pl-2 py-2">No short-term liabilities. Add Bills, Rent, Tax, etc.</p>
            )}
          </div>

          {/* Long-Term — Active Loans + custom personal debt */}
          <SectionHeader
            title="Long-term Liabilities"
            total={s.long_term_liabilities}
            color="border-rose-400 bg-rose-500/5"
            badge="Loans & Debt"
            onAdd={() => openModal("liability")}
          />
          <div className="space-y-2">
            {/* Render active loans from distribution */}
            {s.liability_distribution
              .filter(d => d.liability_type === "active_loans")
              .map(d => (
                <ItemRow
                  key="active_loans"
                  icon={<LiabilityIcon type="active_loans" />}
                  name="Active Loans"
                  sublabel={`${d.count} active loan(s) — managed in Loans section`}
                  badge="Long-term"
                  badgeColor="bg-rose-500/10 text-rose-500"
                  value={d.value}
                />
              ))}
            {/* Render custom long-term liabilities */}
            {longTermLiabs.map(l => (
              <ItemRow
                key={l.id}
                icon={<LiabilityIcon type={l.liability_type} />}
                name={l.name}
                sublabel={LIABILITY_TYPE_LABELS[l.liability_type] ?? l.liability_type}
                badge="Long-term"
                badgeColor="bg-rose-500/10 text-rose-500"
                value={parseFloat(l.value)}
                onEdit={() => openModal("liability", l)}
                onDelete={() => handleDelete("liability", l.id)}
              />
            ))}
            {longTermLiabs.length === 0 && s.liability_distribution.filter(d => d.liability_type === "active_loans").length === 0 && (
              <p className="text-xs text-[var(--color-text-tertiary)] pl-2 py-2">No long-term liabilities tracked.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Form Modal ────────────────────────────────── */}
      <FormModal
        mode={modalMode}
        isOpen={modalOpen}
        editing={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
