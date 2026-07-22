/**
 * DebtProof — EMI Reminder Popup
 * Floating banner shown when EMI is due within 3 days. Dismissible per session.
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { loansService } from "@/services/loans.service";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DueItem {
  loanId: string;
  loanName: string;
  amount: number;
  dueDate: string;
  daysLeft: number;
  isOverdue: boolean;
}

function daysBetween(a: string, b: Date): number {
  const date = new Date(a);
  const diff = date.getTime() - b.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function EMIReminderPopup() {
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const { format } = useCurrency();

  useEffect(() => {
    // Check if already dismissed this session
    const key = `emi-reminder-dismissed-${new Date().toDateString()}`;
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      return;
    }

    loansService.getLoans({ status: "active", page_size: 50 }).then(res => {
      const now = new Date();
      const items: DueItem[] = [];

      for (const loan of res.results || []) {
        if (!loan.next_emi_date) continue;
        const days = daysBetween(loan.next_emi_date, now);

        if (days <= 3) {
          items.push({
            loanId: loan.id,
            loanName: loan.name,
            amount: parseFloat(loan.monthly_emi),
            dueDate: loan.next_emi_date,
            daysLeft: days,
            isOverdue: loan.is_overdue || days < 0,
          });
        }
      }

      if (items.length > 0) {
        setDueItems(items.sort((a, b) => a.daysLeft - b.daysLeft));
        // Small delay for graceful entrance
        setTimeout(() => setVisible(true), 1200);
      }
    }).catch(() => {});
  }, []);

  const dismiss = () => {
    setVisible(false);
    const key = `emi-reminder-dismissed-${new Date().toDateString()}`;
    sessionStorage.setItem(key, "1");
    setTimeout(() => setDismissed(true), 400);
  };

  if (dismissed || dueItems.length === 0) return null;

  const topItem = dueItems[0];
  const hasOverdue = dueItems.some(d => d.isOverdue);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl border backdrop-blur-xl transition-all duration-500 transform ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95 pointer-events-none"
      } ${hasOverdue
        ? "bg-rose-950/95 border-rose-500/50 text-white"
        : "bg-[var(--color-surface)]/95 border-amber-500/40 text-[var(--color-text-primary)]"
      }`}
    >
      <div className="p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Info Section */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg shadow-inner ${
            hasOverdue ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-500 border border-amber-500/40"
          }`}>
            {hasOverdue ? "⚠️" : "🔔"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full animate-ping ${hasOverdue ? "bg-rose-400" : "bg-amber-400"}`} />
              <p className={`text-[10px] font-black uppercase tracking-wider ${hasOverdue ? "text-rose-300" : "text-amber-600 dark:text-amber-400"}`}>
                {hasOverdue ? "Overdue EMI Alert" : `EMI Due ${topItem.daysLeft === 0 ? "Today" : `in ${topItem.daysLeft} Day${topItem.daysLeft > 1 ? "s" : ""}`}`}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs sm:text-sm font-black truncate max-w-[180px] sm:max-w-[220px]">
                {topItem.loanName}
              </p>
              <span className="text-xs font-black text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {format(topItem.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions Section */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[var(--color-border)]/50 pt-2 sm:pt-0">
          <Link
            href={`/dashboard/loans/${topItem.loanId}/payments/new?amount=${topItem.amount}`}
            onClick={dismiss}
            className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold text-center transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Pay EMI</span>
            <span className="text-[10px]">→</span>
          </Link>

          <Link
            href="/dashboard/loans"
            onClick={dismiss}
            className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] transition cursor-pointer"
          >
            View All
          </Link>

          <button
            onClick={dismiss}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
            aria-label="Dismiss Notification"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {dueItems.length > 1 && (
        <div className="px-4 py-1 bg-black/10 text-[10px] text-center font-bold text-[var(--color-text-secondary)] border-t border-white/5">
          +{dueItems.length - 1} more EMI{dueItems.length - 1 > 1 ? "s" : ""} pending action
        </div>
      )}
    </div>
  );
}

export default EMIReminderPopup;
