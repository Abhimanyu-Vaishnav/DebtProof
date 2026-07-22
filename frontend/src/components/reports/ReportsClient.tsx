/**
 * DebtProof — Enhanced Reports & Export Client
 * PDF (print-to-PDF), CSV, JSON export for loan statements, payments, portfolio.
 */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { reportsService } from "@/services/reports.service";
import { loansService } from "@/services/loans.service";
import { assetsService } from "@/services/assets.service";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Loan, Payment, NetWorthSummary, DashboardData } from "@/types";
import { LOAN_TYPE_LABELS } from "@/types";

// ── Print-to-PDF helpers ─────────────────────────────────────────
function triggerPrint(html: string, title: string) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return alert("Please allow popups for PDF export.");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; padding: 32px; }
      .header { border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
      .header h1 { font-size: 20px; font-weight: 800; color: #1d4ed8; }
      .header p { color: #64748b; font-size: 10px; }
      .logo { font-size: 22px; font-weight: 900; color: #1d4ed8; letter-spacing: -0.5px; }
      .meta { display: flex; gap: 24px; margin-bottom: 20px; flex-wrap: wrap; }
      .meta-item { background: #f1f5f9; border-radius: 8px; padding: 10px 14px; }
      .meta-item .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700; }
      .meta-item .value { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #1d4ed8; color: #fff; font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; padding: 8px 12px; text-align: left; font-weight: 700; }
      td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #334155; }
      tr:nth-child(even) td { background: #f8fafc; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-red { background: #fee2e2; color: #991b1b; }
      .badge-blue { background: #dbeafe; color: #1e40af; }
      .section-title { font-size: 12px; font-weight: 800; color: #0f172a; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px; border-bottom: 1.5px solid #e2e8f0; }
      .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
      .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
      .progress-fill { height: 100%; background: #10b981; border-radius: 3px; }
      @media print { body { padding: 16px; } }
    </style>
  </head><body>${html}<script>window.onload = () => { window.print(); window.close(); }<\/script></body></html>`);
  win.document.close();
}

function buildLoanStatementHTML(loans: Loan[], payments: Payment[], format: { format: (v: number | string) => string }, dashData: DashboardData | null) {
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const totalPrincipal = loans.reduce((s, l) => s + parseFloat(l.principal_amount), 0);
  const totalOutstanding = loans.reduce((s, l) => s + parseFloat(l.outstanding_amount), 0);
  const totalPaid = loans.reduce((s, l) => s + parseFloat(l.paid_amount), 0);
  const totalEMI = loans.reduce((s, l) => s + parseFloat(l.monthly_emi), 0);

  return `
    <div class="header">
      <div><div class="logo">💳 DebtProof</div><p>Loan Portfolio Statement · Generated on ${now}</p></div>
      <div style="text-align:right"><p style="font-size:10px;color:#64748b">Confidential</p></div>
    </div>
    <div class="meta">
      <div class="meta-item"><div class="label">Total Loans</div><div class="value">${loans.length}</div></div>
      <div class="meta-item"><div class="label">Total Borrowed</div><div class="value">${format.format(totalPrincipal)}</div></div>
      <div class="meta-item"><div class="label">Total Repaid</div><div class="value" style="color:#166534">${format.format(totalPaid)}</div></div>
      <div class="meta-item"><div class="label">Outstanding</div><div class="value" style="color:#991b1b">${format.format(totalOutstanding)}</div></div>
      <div class="meta-item"><div class="label">Monthly EMI</div><div class="value">${format.format(totalEMI)}</div></div>
    </div>
    <div class="section-title">Active Loan Accounts</div>
    <table>
      <thead><tr>
        <th>Loan Name</th><th>Lender</th><th>Type</th><th>Principal</th>
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
    ${payments.length > 0 ? `
      <div class="section-title" style="margin-top:32px">Payment History (Last 20)</div>
      <table>
        <thead><tr><th>Date</th><th>Loan</th><th>Amount</th><th>Principal</th><th>Interest</th><th>Method</th><th>Status</th></tr></thead>
        <tbody>
          ${payments.slice(0, 20).map(p => `<tr>
            <td>${formatDate(p.payment_date)}</td>
            <td>${p.loan_name}</td>
            <td><strong>${format.format(parseFloat(p.amount))}</strong></td>
            <td style="color:#166534">${format.format(parseFloat(p.principal_component))}</td>
            <td style="color:#d97706">${format.format(parseFloat(p.interest_component))}</td>
            <td style="text-transform:capitalize">${p.payment_method.replace("_"," ")}</td>
            <td><span class="badge ${p.status === 'confirmed' ? 'badge-green' : 'badge-red'}">${p.status}</span></td>
          </tr>`).join("")}
        </tbody>
      </table>` : ""}
    <div class="footer">
      <span>DebtProof — Loan Portfolio Statement</span>
      <span>Generated: ${now} · This is a system-generated statement.</span>
    </div>`;
}

// ── Report Card ─────────────────────────────────────────────────
function ReportCard({ icon, title, description, onDownloadCSV, onDownloadPDF, loadingKey, downloading }: {
  icon: string; title: string; description: string;
  onDownloadCSV?: () => void; onDownloadPDF?: () => void;
  loadingKey: string; downloading: string | null;
}) {
  return (
    <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-black text-[var(--color-text-primary)]">{title}</p>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onDownloadCSV && (
          <button onClick={onDownloadCSV} disabled={!!downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors disabled:opacity-50 cursor-pointer">
            {downloading === `${loadingKey}-csv` ? "⏳ Exporting..." : "📊 CSV / JSON"}
          </button>
        )}
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} disabled={!!downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer">
            {downloading === `${loadingKey}-pdf` ? "⏳ Preparing..." : "📄 Export PDF"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export function ReportsClient() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [netWorthSummary, setNetWorthSummary] = useState<NetWorthSummary | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
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
    ]).then(([loansResp, nw, dash, paymentsResp]) => {
      setLoans(loansResp.results || []);
      setNetWorthSummary(nw);
      setDashData(dash);
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
    } catch { alert("Failed to export."); }
    finally { setDownloading(null); }
  };

  const triggerUnifiedExport = async (reportType: string) => {
    setDownloading(`${reportType}-csv`);
    try { await reportsService.downloadUnifiedReport(reportType, exportFormat); }
    catch { alert(`Failed to export ${reportType} report.`); }
    finally { setDownloading(null); }
  };

  const exportLoanStatementPDF = () => {
    setDownloading("loans-pdf");
    const html = buildLoanStatementHTML(loans, payments, { format }, dashData);
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
        <div><div class="logo">💳 DebtProof</div><p>Payment History Report · Generated on ${now}</p></div>
      </div>
      <div class="meta">
        <div class="meta-item"><div class="label">Total Payments</div><div class="value">${filteredPayments.length}</div></div>
        <div class="meta-item"><div class="label">Total Amount</div><div class="value">${format(totalAmount)}</div></div>
        ${startDate ? `<div class="meta-item"><div class="label">From</div><div class="value">${formatDate(startDate)}</div></div>` : ""}
        ${endDate ? `<div class="meta-item"><div class="label">To</div><div class="value">${formatDate(endDate)}</div></div>` : ""}
      </div>
      <table>
        <thead><tr><th>#</th><th>Date</th><th>Loan</th><th>Amount</th><th>Principal</th><th>Interest</th><th>Method</th><th>Status</th><th>Ref No.</th></tr></thead>
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
      <div class="footer"><span>DebtProof Payment History</span><span>Generated: ${now}</span></div>`;
    triggerPrint(html, "DebtProof — Payment History Report");
    setDownloading(null);
  };

  const exportNetWorthPDF = () => {
    if (!netWorthSummary) return;
    setDownloading("networth-pdf");
    const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const html = `
      <div class="header">
        <div><div class="logo">💳 DebtProof</div><p>Net Worth Statement · Generated on ${now}</p></div>
      </div>
      <div class="meta">
        <div class="meta-item"><div class="label">Net Worth</div><div class="value" style="color:${netWorthSummary.net_worth >= 0 ? '#166534' : '#991b1b'}">${format(netWorthSummary.net_worth)}</div></div>
        <div class="meta-item"><div class="label">Total Assets</div><div class="value" style="color:#166534">${format(netWorthSummary.total_assets)}</div></div>
        <div class="meta-item"><div class="label">Total Liabilities</div><div class="value" style="color:#991b1b">${format(netWorthSummary.total_liabilities)}</div></div>
        <div class="meta-item"><div class="label">Current Assets</div><div class="value">${format(netWorthSummary.current_assets)}</div></div>
        <div class="meta-item"><div class="label">Fixed Assets</div><div class="value">${format(netWorthSummary.fixed_assets)}</div></div>
      </div>
      <div class="section-title">Asset Distribution</div>
      <table>
        <thead><tr><th>Asset Type</th><th>Value</th><th>Count</th></tr></thead>
        <tbody>${netWorthSummary.asset_distribution.map(a => `<tr><td>${a.label}</td><td>${format(a.value)}</td><td>${a.count}</td></tr>`).join("")}</tbody>
      </table>
      <div class="section-title" style="margin-top:24px">Liability Distribution</div>
      <table>
        <thead><tr><th>Liability Type</th><th>Value</th><th>Count</th></tr></thead>
        <tbody>${netWorthSummary.liability_distribution.map(l => `<tr><td>${l.label}</td><td>${format(l.value)}</td><td>${l.count}</td></tr>`).join("")}</tbody>
      </table>
      <div class="footer"><span>DebtProof Net Worth Statement</span><span>Generated: ${now}</span></div>`;
    triggerPrint(html, "DebtProof — Net Worth Statement");
    setDownloading(null);
  };

  if (loading) return <LoadingSpinner size="md" label="Loading reports..." />;

  const totalOutstanding = loans.reduce((s, l) => s + parseFloat(l.outstanding_amount), 0);
  const totalPaid = loans.reduce((s, l) => s + parseFloat(l.paid_amount), 0);

  return (
    <div className="space-y-6 pb-12">

      {/* Header Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Loans", value: loans.length.toString(), icon: "🏦", color: "text-[var(--color-primary-light)]" },
          { label: "Total Repaid", value: format(totalPaid), icon: "✅", color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Outstanding", value: format(totalOutstanding), icon: "🔴", color: "text-rose-600 dark:text-rose-400" },
          { label: "Net Worth", value: format(netWorthSummary?.net_worth ?? 0), icon: "💎", color: "text-blue-600 dark:text-blue-400" },
        ].map(s => (
          <div key={s.label} className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-4">🔧 Filter Options (applies to CSV/JSON exports)</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={selectedLoanId} onChange={e => setSelectedLoanId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]">
            <option value="">All Loans</option>
            {loans.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date"
            className="px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date"
            className="px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]" />
          <div className="flex gap-2">
            {(["csv", "json"] as const).map(f => (
              <button key={f} onClick={() => setExportFormat(f)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${exportFormat === f ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-4">📋 Available Reports</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard
            icon="🏦" title="Loan Portfolio Statement"
            description="Complete list of all your loans — principal, paid amount, outstanding balance, interest rate, EMI, and repayment progress."
            loadingKey="loans" downloading={downloading}
            onDownloadCSV={() => triggerUnifiedExport("loans")}
            onDownloadPDF={exportLoanStatementPDF}
          />
          <ReportCard
            icon="💳" title="Payment History Report"
            description="All EMI payment transactions with principal/interest split, payment method, reference numbers, and status."
            loadingKey="payments" downloading={downloading}
            onDownloadCSV={triggerPaymentsExport}
            onDownloadPDF={exportPaymentHistoryPDF}
          />
          <ReportCard
            icon="💎" title="Net Worth Statement"
            description="Assets vs liabilities breakdown — current and fixed assets, loan liabilities, and overall net worth position."
            loadingKey="networth" downloading={downloading}
            onDownloadCSV={() => triggerUnifiedExport("assets")}
            onDownloadPDF={exportNetWorthPDF}
          />
          <ReportCard
            icon="💳" title="Credit Cards Statement"
            description="Credit card outstanding balances, limit utilization, minimum dues, and billing cycle information."
            loadingKey="credit_cards" downloading={downloading}
            onDownloadCSV={() => triggerUnifiedExport("credit_cards")}
          />
        </div>
      </div>

      {/* PDF Instructions */}
      <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex items-start gap-3">
        <span className="text-xl mt-0.5">💡</span>
        <div>
          <p className="text-xs font-black text-[var(--color-text-primary)]">PDF Export Instructions</p>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            Click <strong>"Export PDF"</strong> → A print preview will open in a new tab → Select <strong>"Save as PDF"</strong> as destination → Click Print. Works on all browsers (Chrome, Edge, Firefox, Safari).
          </p>
        </div>
      </div>

    </div>
  );
}
