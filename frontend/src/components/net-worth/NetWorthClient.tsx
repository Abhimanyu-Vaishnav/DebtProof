"use client";

import React, { useEffect, useState } from "react";
import { assetsService, AssetFormData } from "@/services/assets.service";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Asset, NetWorthSummary, AssetType } from "@/types";
import { ASSET_TYPE_LABELS } from "@/types";

export function NetWorthClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<AssetType>("cash");
  const [formValue, setFormValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [assetsData, summaryData] = await Promise.all([
        assetsService.getAssets(),
        assetsService.getNetWorth(),
      ]);
      setAssets(assetsData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError("Failed to load net worth details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingAsset(null);
    setFormName("");
    setFormType("cash");
    setFormValue("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormType(asset.asset_type);
    setFormValue(asset.value);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const valNum = parseFloat(formValue);
    if (!formName.trim()) {
      setFormError("Asset name is required.");
      return;
    }
    if (isNaN(valNum) || valNum <= 0) {
      setFormError("Asset value must be greater than zero.");
      return;
    }

    const payload: AssetFormData = {
      name: formName.trim(),
      asset_type: formType,
      value: valNum.toFixed(2),
    };

    try {
      setLoading(true);
      if (editingAsset) {
        await assetsService.updateAsset(editingAsset.id, payload);
      } else {
        await assetsService.createAsset(payload);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError("Failed to save asset. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      setLoading(true);
      await assetsService.deleteAsset(id);
      await fetchData();
    } catch (err) {
      setError("Failed to delete asset.");
      setLoading(false);
    }
  };

  if (loading && assets.length === 0) {
    return <LoadingSpinner size="md" label="Loading balance sheet..." />;
  }

  if (error || !summary) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--color-error)] mb-3">{error ?? "No data available."}</p>
        <button className="btn btn-primary btn-sm" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  // Calculate percentage of assets vs liabilities for progress bar
  const totalAssets = summary.total_assets;
  const totalLiabilities = summary.total_liabilities;
  const assetRatio = totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 0;
  const liabilityRatio = totalAssets + totalLiabilities > 0 ? (totalLiabilities / (totalAssets + totalLiabilities)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Worth Card */}
        <div className="card p-5 border-l-4 border-emerald-500 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-secondary)]">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actual Net Worth</p>
          <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">
            {formatCurrency(summary.net_worth)}
          </h3>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
            Real-time Assets minus Outstanding Debts
          </p>
        </div>

        {/* Total Assets Card */}
        <div className="card p-5 border-l-4 border-blue-500">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Assets</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(summary.total_assets)}
          </h3>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
            Investments, bank deposits, and liquid cash
          </p>
        </div>

        {/* Total Liabilities Card */}
        <div className="card p-5 border-l-4 border-rose-500">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Liabilities</p>
          <h3 className="text-2xl font-bold text-rose-500 mt-1">
            {formatCurrency(summary.total_liabilities)}
          </h3>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
            Your active loan balances and debts
          </p>
        </div>
      </section>

      {/* Progress Bar comparison */}
      {(totalAssets > 0 || totalLiabilities > 0) && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-500">Assets ({assetRatio.toFixed(1)}%)</span>
            <span className="text-xs font-bold text-rose-500">Liabilities ({liabilityRatio.toFixed(1)}%)</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden flex">
            <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${assetRatio}%` }} />
            <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${liabilityRatio}%` }} />
          </div>
        </section>
      )}

      {/* Asset Manager Table & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list of assets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Asset Checklist</h3>
            <button className="btn btn-primary btn-sm" onClick={openAddModal}>
              + Add Asset
            </button>
          </div>

          <div className="card overflow-hidden">
            {assets.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">No assets listed yet.</p>
                <button className="btn btn-primary btn-sm" onClick={openAddModal}>Add Your First Asset</button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface-secondary)] border-b border-[var(--color-border-light)]">
                    <th className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase">Name</th>
                    <th className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase">Type</th>
                    <th className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase">Value</th>
                    <th className="p-4 text-xs font-bold text-[var(--color-text-tertiary)] uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-secondary)]/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-[var(--color-text-primary)]">{asset.name}</td>
                      <td className="p-4 text-xs text-[var(--color-text-secondary)]">
                        <span className="bg-[var(--color-surface-tertiary)] px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                          {ASSET_TYPE_LABELS[asset.asset_type] ?? asset.asset_type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-[var(--color-text-primary)]">{formatCurrency(parseFloat(asset.value))}</td>
                      <td className="p-4 text-sm text-right space-x-2">
                        <button className="btn btn-secondary btn-xs" onClick={() => openEditModal(asset)}>Edit</button>
                        <button className="btn btn-error btn-xs opacity-80 hover:opacity-100" onClick={() => handleDelete(asset.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Asset breakdown breakdown chart list */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Breakdown</h3>
          <div className="card p-5 space-y-4">
            {summary.type_distribution.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] text-center py-6">Add assets to see category distribution.</p>
            ) : (
              summary.type_distribution.map((item) => {
                const pct = totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;
                return (
                  <div key={item.asset_type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">{item.label}</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">{formatCurrency(item.value)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Asset Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card w-full max-w-md p-6 relative bg-[var(--color-surface)] shadow-2xl animate-scale-in">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
              {editingAsset ? "Edit Asset" : "Add Asset"}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Asset Name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. ICICI Savings, Gold Coins"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Asset Type</label>
                  <select
                    className="input w-full h-10 py-1"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AssetType)}
                  >
                    {Object.entries(ASSET_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    placeholder="0.00"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
