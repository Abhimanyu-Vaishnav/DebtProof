/**
 * DebtProof — Modern & Responsive Reports Client
 * Premium UI with category tabs, live interactive report previews, PDF print-to-PDF, CSV, & JSON data exports.
 */
"use client";

import React, { useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";
import { loansService } from "@/services/loans.service";
import { assetsService } from "@/services/assets.service";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Loan, Payment, NetWorthSummary, DashboardData } from "@/types";
import { LOAN_TYPE_LABELS } from "@/types";

// ── PDF Print Helper ──────────────────────────────────────────────
function triggerPrint(html: string, title: string) {
  const win = window.open("", "_blank", "width=960,height=750");
  if (!win) return alert("Please allow popups to export PDF.");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; color: #0f172a; background: #fff; padding: 36px; }
      .header { border-bottom: 3px solid #2563eb; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
      .header h1 { font-size: 22px; font-weight: 900; color: #1e40af; letter-spacing: -0.5px; }
      .header p { color: #64748b; font-size: 10px; font-weight: 500; margin-top: 2px; }
      .logo { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
      .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
      .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; }
      .meta-card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 800; }
      .meta-card .value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 3px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 10px; }
      th { background: #1e40af; color: #ffffff; font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; text-align: left; font-weight: 800; }
      td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
      tr:nth-child(even) td { background: #f8fafc; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-red { background: #fee2e2; color: #991b1b; }
      .badge-blue { background: #dbeafe; color: #1e40af; }
      .section-title { font-size: 12px; font-weight: 900; color: #0f172a; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; font-weight: 500; }
      .progress-bar { height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
      @media print { body { padding: 20px; } }
    </style>
  </head><body>${html}<script>window.onload = () => { window.print(); window.close(); }<\/script></body></html>`);
  win.document.close();
}

function buildLoanStatementHTML(loans: Loan[], payments: Payment[], format: { format: (v: number | string) => string }) {
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const totalPrincipal = loans.reduce((s, l) => s + parseFloat(l.principal_amount), 0);
  const totalOutstanding = loans.reduce((s, l) => s + parseFloat(l.outstanding_amount), 0);
  const totalPaid = loans.reduce((s, l) => s + parseFloat(l.paid_amount), 0);
  const totalEMI = loans.reduce((s, l) => s + parseFloat(l.monthly_emi), 0);

  return `
    <div class="header">
      <div><div class="logo">💳 DebtProof</div><p>Official Loan Portfolio Statement · Generated ${now}</p></div>
      <div style="text-align:right"><p style="font-size:10px;color:#64748b;font-weight:700">CONFIDENTIAL</p></div>
    </div>
    <div class="meta-grid">
      <div class="meta-card"><div class="label">Total Accounts</div><div class="value">${loans.length}</div></div>
      <div class="meta-card"><div class="label">Total Principal</div><div class="value">${format.format(totalPrincipal)}</div></div>
      <div class="meta-card"><div class="label">Principal Repaid</div><div class="value" style="color:#166534">${format.format(totalPaid)}</div></div>
      <div class="meta-card"><div class="label">Outstanding</div><div class="value" style="color:#991b1b">${format.format(totalOutstanding)}</div></div>
    </div>
    <div class="section-title">Active Loan Accounts</div>
    <table>
      <thead><tr>
        <th>Loan Account</th><th>Lender</th><th>Category</th><th>Principal</th>
        <th>Paid</th><th>Outstanding</th><th>Rate</th><th>EMI/mo</th><th>Progress</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${loans.map(l => {
          const prog = l.repayment_progress_percent;
          return `<tr>
            <td><strong>${l.name}</strong>${l.account_number ? `<br><span style="color:#94a3b8;font-size:9px">${l.account_number}</span>` : ""}</td>
            <td>${l.lender_name}</td>
            <td>${LOAN_TYPE_LABELS[l.loan_type] || l.loan_type}</td>
            <td>${format.format(parseFloat(l.principal_amount))}</td>
            <td style="color:#166534">${format.format(parseFloat(l.paid_amount))}</td>
            <td style="color:#991b1b">${format.format(parseFloat(l.outstanding_amount))}</td>
            <td>${l.interest_rate}%</td>
            <td>${format.format(parseFloat(l.monthly_emi))}</td>
            <td><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,prog)}%"></div></div><span style="font-size:9px;color:#64748b">${prog.toFixed(1)}%</span></td>
            <td><span class="badge ${l.status === 'active' ? 'badge-blue' : l.is_overdue ? 'badge-red' : 'badge-green'}">${l.is_overdue ? 'Overdue' : l.status}</span></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
    <div class="footer">
      <span>DebtProof Financial Intelligence System</span>
      <span>Generated ${now} · Authenticated Log</span>
    </div>`;
}

// ── Main Reports Component ────────────────────────────────────────
export function ReportsClient() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [netWorthSummary, setNetWorthSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Filters & Active Category
  const [activeCategory, setActiveCategory] = useState<"all" | "loans" | "payments" | "networth" | "credit">("all");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const { format } = useCurrency();

  useEffect(() => {
    Promise.all([
      loansService.getLoans({ page_size: 100 }),
      assetsService.getNetWorth(),
      loansService.getDashboard(),
      paymentsService.getAllPayments({ page_size: 50, ordering: "-payment_date" }),
    ]).then(([loansResp, nw, _, paymentsResp]) => {
      setLoans(loansResp.results || []);
      setNetWorthSummary(nw);
      setPayments(paymentsResp.results || []);
    }).finally(() => setLoading(false));
  }, []);

  const triggerPaymentsExport = async () => {
    setDownloading("payments-csv");
    try {
      await reportsService.downloadPaymentsReport({
        loan_id: selectedLoanId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        format: exportFormat,
      });
    } catch { alert("Failed to export Payments Report."); }
    finally { setDownloading(null); }
  };

  const triggerUnifiedExport = async (reportType: string) => {
    setDownloading(`${reportType}-${exportFormat}`);
    try { await reportsService.downloadUnifiedReport(reportType, exportFormat); }
    catch { alert(`Failed to export ${reportType} report.`); }
    finally { setDownloading(null); }
  };

  const exportLoanStatementPDF = () => {
    setDownloading("loans-pdf");
    const html = buildLoanStatementHTML(loans, payments, { format });
    triggerPrint(html, "DebtProof — Loan Portfolio Statement");
    setDownloading(null);
  };

  const exportPaymentHistoryPDF = () => {
    setDownloading("payments-pdf");
    const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const filteredPayments = payments.filter(p => {
      if (selectedLoanId && p.loan !== selectedLoanId) return false;
      if (startDate && p.payment_date < startDate) return false;
      if (endDate && p.payment_date > endDate) return false;
      return true;
    });
    const totalAmount = filteredPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
    const html = `
      <div class="header">
        <div><div class="logo">💳 DebtProof</div><p>Official Payment History Log · Generated ${now}</p></div>
      </div>
      <div class="meta-grid">
        <div class="meta-card"><div class="label">Transactions</div><div class="value">${filteredPayments.length}</div></div>
        <div class="meta-card"><div class="label">Total Amount Paid</div><div class="value">${format(totalAmount)}</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Loan Name</th><th>Amount</th><th>Principal</th><th>Interest</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead>
        <tbody>
          ${filteredPayments.map((p, i) => `<tr>
            <td>${i + 1}</td>
            <td>${formatDate(p.payment_date)}</td>
            <td>${p.loan_name}</td>
            <td><strong>${format(parseFloat(p.amount))}</strong></td>
            <td style="color:#166534">${format(parseFloat(p.principal_component))}</td>
            <td style="color:#d97706">${format(parseFloat(p.interest_component))}</td>
            <td style="text-transform:capitalize">${p.payment_method.replace("_"," ")}</td>
            <td><span class="badge ${p.status === 'confirmed' ? 'badge-green' : 'badge-red'}">${p.status}</span></td>
            <td style="font-family:monospace;font-size:9px">${p.reference_number || "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="footer"><span>DebtProof Payment Audit Trail</span><span>Generated ${now}</span></div>`;
    triggerPrint(html, "DebtProof — Payment History Report");
    setDownloading(null);
  };

  const exportNetWorthPDF = () => {
    if (!netWorthSummary) return;
    setDownloading("networth-pdf");
    const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const html = `
      <div class="header">
        <div><div class="logo">💳 DebtProof</div><p>Net Worth Statement · Generated ${now}</p></div>
      </div>
      <div class="meta-grid">
        <div class="meta-card"><div class="label">Net Worth</div><div class="value">${format(netWorthSummary.net_worth)}</div></div>
        <div class="meta-card"><div class="label">Total Assets</div><div class="value" style="color:#166534">${format(netWorthSummary.total_assets)}</div></div>
        <div class="meta-card"><div class="label">Total Liabilities</div><div class="value" style="color:#991b1b">${format(netWorthSummary.total_liabilities)}</div></div>
      </div>
      <div class="section-title">Asset Breakdown</div>
      <table>
        <thead><tr><th>Category</th><th>Valuation</th><th>Count</th></tr></thead>
        <tbody>${netWorthSummary.asset_distribution.map(a => `<tr><td>${a.label}</td><td>${format(a.value)}</td><td>${a.count}</td></tr>`).join("")}</tbody>
      </table>
      <div class="section-title">Liability Breakdown</div>
      <table>
        <thead><tr><th>Category</th><th>Valuation</th><th>Count</th></tr></thead>
        <tbody>${netWorthSummary.liability_distribution.map(l => `<tr><td>${l.label}</td><td>${format(l.value)}</td><td>${l.count}</td></tr>`).join("")}</tbody>
      </table>
      <div class="footer"><span>DebtProof Wealth Audit</span><span>Generated ${now}</span></div>`;
    triggerPrint(html, "DebtProof — Net Worth Statement");
    setDownloading(null);
  };

  if (loading) return <LoadingSpinner fullPage label="Preparing financial reporting engine..." />;

  const totalOutstanding = loans.reduce((s, l) => s + parseFloat(l.outstanding_amount), 0);
  const totalPaid = loans.reduce((s, l) => s + parseFloat(l.paid_amount), 0);
  const totalPrincipal = loans.reduce((s, l) => s + parseFloat(l.principal_amount), 0);

  // Filtered payments preview
  const filteredPayments = payments.filter(p => {
    if (selectedLoanId && p.loan !== selectedLoanId) return false;
    if (startDate && p.payment_date < startDate) return false;
    if (endDate && p.payment_date > endDate) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-20">

      {/* ── TOP KPI OVERVIEW ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Loan Accounts</span>
            <span className="text-base">🏦</span>
          </div>
          <p className="text-xl font-black text-[var(--color-primary-light)] mt-1">{loans.length}</p>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">Principal: {format(totalPrincipal)}</p>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Repaid</span>
            <span className="text-base">✅</span>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{format(totalPaid)}</p>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">Cleared principal</p>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Active Outstanding</span>
            <span className="text-base">🔴</span>
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{format(totalOutstanding)}</p>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">Current debt balance</p>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Calculated Net Worth</span>
            <span className="text-base">💎</span>
          </div>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{format(netWorthSummary?.net_worth ?? 0)}</p>
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">Assets minus liabilities</p>
        </div>
      </div>

      {/* ── FILTER & FORMAT CONTROL BAR ───────────────────────── */}
      <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
            ⚙️ Report Filters & Export Formats
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">
            Applies to CSV, JSON & PDF Reports
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-1">Select Account</label>
            <select
              value={selectedLoanId}
              onChange={e => setSelectedLoanId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">All Loan Accounts</option>
              {loans.map(l => <option key={l.id} value={l.id}>{l.name} ({l.lender_name})</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-1">Data Format</label>
            <div className="flex gap-2">
              {(["csv", "json"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setExportFormat(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    exportFormat === f
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-tertiary)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TAB FILTER ──────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Statements", icon: "📋" },
          { id: "loans", label: "Loan Accounts", icon: "🏦" },
          { id: "payments", label: "Payment History", icon: "💳" },
          { id: "networth", label: "Net Worth Audit", icon: "💎" },
          { id: "credit", label: "Credit Cards", icon: "💳" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-tertiary)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── REPORT CARDS GRID ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(activeCategory === "all" || activeCategory === "loans") && (
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 hover:border-[var(--color-primary-light)] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">🏦</span>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">Loan Portfolio Statement</h3>
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{loans.length} active loan account(s)</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Complete official statement of all loan accounts including lender names, principal amounts, paid principal, outstanding balances, interest rates, and overall repayment progress.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-light)] flex gap-2">
              <button
                onClick={exportLoanStatementPDF}
                disabled={!!downloading}
                className="flex-1 btn btn-primary btn-sm font-black text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloading === "loans-pdf" ? "⏳ Generating..." : "📄 Export PDF Statement"}
              </button>
              <button
                onClick={() => triggerUnifiedExport("loans")}
                disabled={!!downloading}
                className="btn btn-secondary btn-sm font-bold text-xs px-3 py-2 cursor-pointer"
              >
                📊 {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {(activeCategory === "all" || activeCategory === "payments") && (
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 hover:border-[var(--color-primary-light)] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">💳</span>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">Payment History Report</h3>
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{filteredPayments.length} payment log(s)</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Itemized transaction history containing payment dates, loan references, payment methods (UPI, Auto-Debit, Transfer), principal vs interest split, and transaction status.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-light)] flex gap-2">
              <button
                onClick={exportPaymentHistoryPDF}
                disabled={!!downloading}
                className="flex-1 btn btn-primary btn-sm font-black text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloading === "payments-pdf" ? "⏳ Generating..." : "📄 Export PDF Log"}
              </button>
              <button
                onClick={triggerPaymentsExport}
                disabled={!!downloading}
                className="btn btn-secondary btn-sm font-bold text-xs px-3 py-2 cursor-pointer"
              >
                📊 {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {(activeCategory === "all" || activeCategory === "networth") && (
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 hover:border-[var(--color-primary-light)] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">💎</span>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">Net Worth Audit Statement</h3>
                  <span className="text-[10px] font-bold text-emerald-500 font-black">Net Worth: {format(netWorthSummary?.net_worth ?? 0)}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Comprehensive wealth audit listing all asset categories (Bank accounts, FDs, Real Estate, Investments) vs short/long-term liabilities.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-light)] flex gap-2">
              <button
                onClick={exportNetWorthPDF}
                disabled={!!downloading}
                className="flex-1 btn btn-primary btn-sm font-black text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloading === "networth-pdf" ? "⏳ Generating..." : "📄 Export PDF Audit"}
              </button>
              <button
                onClick={() => triggerUnifiedExport("assets")}
                disabled={!!downloading}
                className="btn btn-secondary btn-sm font-bold text-xs px-3 py-2 cursor-pointer"
              >
                📊 {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {(activeCategory === "all" || activeCategory === "credit") && (
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 hover:border-[var(--color-primary-light)] transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">💳</span>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">Credit Cards Statement</h3>
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">Outstanding & Limits</span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Detailed billing statement of active credit cards, total credit utilization, available limit margins, and minimum due obligations.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-light)] flex gap-2">
              <button
                onClick={() => triggerUnifiedExport("credit_cards")}
                disabled={!!downloading}
                className="flex-1 btn btn-primary btn-sm font-black text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📊 Export {exportFormat.toUpperCase()} Statement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LIVE INTERACTIVE PREVIEW TABLE ────────────────────── */}
      <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">
              👀 Live Report Data Preview ({filteredPayments.length} Payments)
            </h3>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Instant on-screen preview of selected account & date filters.</p>
          </div>
          <span className="text-xs font-bold text-[var(--color-primary-light)]">Interactive Audit Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Loan Account</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Principal</th>
                <th className="py-2.5 px-3">Interest</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--color-text-secondary)]">
                    No payment logs match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-surface-secondary)] transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-[var(--color-text-secondary)]">{formatDate(p.payment_date)}</td>
                    <td className="py-2.5 px-3 font-bold text-[var(--color-text-primary)]">{p.loan_name}</td>
                    <td className="py-2.5 px-3 font-black text-[var(--color-text-primary)]">{format(parseFloat(p.amount))}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{format(parseFloat(p.principal_component))}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">{format(parseFloat(p.interest_component))}</td>
                    <td className="py-2.5 px-3 capitalize text-[var(--color-text-secondary)]">{p.payment_method.replace("_", " ")}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
