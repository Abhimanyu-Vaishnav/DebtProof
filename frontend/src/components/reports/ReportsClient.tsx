"use client";

import React, { useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";
import { loansService } from "@/services/loans.service";
import { assetsService } from "@/services/assets.service";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Loan, NetWorthSummary } from "@/types";

export function ReportsClient() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [netWorthSummary, setNetWorthSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Filters State
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  useEffect(() => {
    const initData = async () => {
      try {
        const [loansResp, nwResp] = await Promise.all([
          loansService.getLoans({ page_size: 100 }),
          assetsService.getNetWorth(),
        ]);
        setLoans(loansResp.results || []);
        setNetWorthSummary(nwResp);
      } catch {
        console.error("Failed to load reference data for reports filters.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const triggerPaymentsExport = async () => {
    setDownloading("payments");
    try {
      await reportsService.downloadPaymentsReport({
        loan_id: selectedLoanId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        format: exportFormat,
      });
    } catch {
      alert("Failed to export Payments Report.");
    } finally {
      setDownloading(null);
    }
  };

  const triggerUnifiedExport = async (reportType: string, format: string) => {
    setDownloading(`${reportType}-${format}`);
    try {
      await reportsService.downloadUnifiedReport(reportType, format);
    } catch {
      alert(`Failed to export ${reportType} report in ${format.toUpperCase()} format.`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" label="Loading reports and dashboards..." />;
  }

  const totalOutstandingLiabs = netWorthSummary ? netWorthSummary.total_liabilities : 0;
  const totalAssetsVal = netWorthSummary ? netWorthSummary.total_assets : 0;
  const netWorthVal = netWorthSummary ? netWorthSummary.net_worth : 0;

  const modules = [
    { type: "payments", name: "Payments History", icon: "📊", desc: "Detailed breakdown of EMI payments, principal/interest components, and transaction status." },
    { type: "loans", name: "Loans Statement", icon: "🏦", desc: "Statement list of active/closed debt accounts, principal amounts, and interest percentages." },
    { type: "assets", name: "Assets Statement", icon: "🏠", desc: "List of liquid and fixed assets, holdings values, and account categories." },
    { type: "credit_cards", name: "Credit Cards Statement", icon: "💳", desc: "Outstanding credit card balance reports, limit margins, and billing statements cycles." },
    { type: "net_worth", name: "Net Worth Statement", icon: "💼", desc: "Overall summary sheet aggregating assets equity coverage vs outstanding liabilities load." },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Report Cards Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 bg-gradient-to-br from-indigo-950/20 to-slate-900 border border-[var(--color-border-light)] relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] tracking-wider">Asset Equity Coverage</p>
          <p className="text-2xl font-extrabold text-blue-400 mt-2">{formatCurrency(totalAssetsVal)}</p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full" style={{ width: totalAssetsVal > 0 ? "100%" : "0%" }} />
          </div>
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-2 block">Total capital resources tracked.</span>
        </div>

        <div className="card p-5 bg-gradient-to-br from-rose-950/20 to-slate-900 border border-[var(--color-border-light)] relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] tracking-wider">Active Liabilities Load</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">{formatCurrency(totalOutstandingLiabs)}</p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-400 h-full"
              style={{
                width: `${totalAssetsVal > 0 ? Math.min((totalOutstandingLiabs / totalAssetsVal) * 100, 100) : 0}%`,
              }}
            />
          </div>
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-2 block">
            Debt-to-Asset Ratio: {totalAssetsVal > 0 ? ((totalOutstandingLiabs / totalAssetsVal) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-[var(--color-border-light)] relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] tracking-wider">Actual Asset Cover</p>
          <p className={`text-2xl font-extrabold mt-2 ${netWorthVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatCurrency(netWorthVal)}
          </p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${netWorthVal >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
              style={{ width: "100%" }}
            />
          </div>
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-2 block">Actual net worth index.</span>
        </div>
      </section>

      {/* Main interactive customization panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Advance Parameters Filter Panel */}
        <div className="card p-6 space-y-4 border border-[var(--color-border-light)] lg:col-span-1">
          <div className="border-b border-[var(--color-border-light)] pb-2.5">
            <h4 className="font-bold text-sm text-[var(--color-text-primary)]">Payments Custom Filter</h4>
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Applies exclusively to payments history exports below</p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">Filter by Loan Account</label>
              <select
                className="input w-full py-1 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-[var(--color-border)] rounded-[var(--radius-md)] h-10"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
              >
                <option value="">All Loans & Liabilities</option>
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.name} ({loan.lender_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">Start Date</label>
                <input
                  type="date"
                  className="input w-full text-xs h-10"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">End Date</label>
                <input
                  type="date"
                  className="input w-full text-xs h-10"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">Format (Custom Payments)</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`btn btn-sm ${exportFormat === "csv" ? "btn-primary" : "btn-secondary"}`}
                >
                  CSV Format
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("json")}
                  className={`btn btn-sm ${exportFormat === "json" ? "btn-primary" : "btn-secondary"}`}
                >
                  JSON Format
                </button>
              </div>
            </div>

            <button
              onClick={triggerPaymentsExport}
              disabled={downloading !== null}
              className="btn btn-primary btn-sm w-full py-2.5 font-bold"
            >
              {downloading === "payments" ? "Exporting..." : `Download Filtered Payments (${exportFormat.toUpperCase()})`}
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Report Types triggers */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Available Report Modules</h4>
          
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.type} className="card p-5 border border-[var(--color-border-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-secondary)]">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mod.icon}</span>
                    <h5 className="font-bold text-sm text-[var(--color-text-primary)]">{mod.name}</h5>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] max-w-md">
                    {mod.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => triggerUnifiedExport(mod.type, "csv")}
                    disabled={downloading !== null}
                    className="btn btn-secondary btn-sm px-3 text-[11px]"
                  >
                    {downloading === `${mod.type}-csv` ? "..." : "CSV"}
                  </button>
                  <button
                    onClick={() => triggerUnifiedExport(mod.type, "xls")}
                    disabled={downloading !== null}
                    className="btn btn-secondary btn-sm px-3 text-[11px]"
                  >
                    {downloading === `${mod.type}-xls` ? "..." : "XLS / Excel"}
                  </button>
                  <button
                    onClick={() => triggerUnifiedExport(mod.type, "pdf")}
                    disabled={downloading !== null}
                    className="btn btn-primary btn-sm px-3 text-[11px]"
                  >
                    {downloading === `${mod.type}-pdf` ? "..." : "PDF / Print"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
