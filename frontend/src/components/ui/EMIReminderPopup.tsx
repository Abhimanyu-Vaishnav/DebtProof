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
      className={`fixed bottom-6 right-4 z-50 w-80 shadow-2xl rounded-2xl border overflow-hidden transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${hasOverdue
        ? "bg-rose-950/95 border-rose-500/40 backdrop-blur-md"
        : "bg-[var(--color-surface)] border-amber-500/40 backdrop-blur-md"
      }`}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${hasOverdue ? "bg-rose-900/60" : "bg-amber-500/10"}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{hasOverdue ? "⚠️" : "🔔"}</span>
          <p className={`text-xs font-black uppercase tracking-wider ${hasOverdue ? "text-rose-300" : "text-amber-600 dark:text-amber-400"}`}>
            {hasOverdue ? "Overdue EMI Alert" : `EMI Due ${topItem.daysLeft === 0 ? "Today" : `in ${topItem.daysLeft} Day${topItem.daysLeft > 1 ? "s" : ""}`}`}
          </p>
        </div>
        <button onClick={dismiss} className="p-1 rounded-full hover:bg-white/10 transition cursor-pointer text-[var(--color-text-secondary)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {dueItems.slice(0, 3).map(item => (
          <Link key={item.loanId} href={`/dashboard/loans/${item.loanId}`}
            onClick={dismiss}
            className="flex items-center justify-between group rounded-xl p-2.5 hover:bg-white/5 transition cursor-pointer">
            <div>
              <p className="text-sm font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                {item.loanName}
              </p>
              <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-0.5">
                {item.isOverdue
                  ? `Overdue by ${Math.abs(item.daysLeft)} day${Math.abs(item.daysLeft) !== 1 ? "s" : ""}`
                  : item.daysLeft === 0 ? "Due today!" : `Due on ${new Date(item.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                }
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${item.isOverdue ? "text-rose-400" : "text-amber-500"}`}>
                {format(item.amount)}
              </p>
              <svg className="w-3 h-3 text-[var(--color-text-secondary)] ml-auto mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}

        {dueItems.length > 3 && (
          <p className="text-[10px] text-center text-[var(--color-text-secondary)] font-medium">
            +{dueItems.length - 3} more upcoming EMIs
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link href="/dashboard/loans" onClick={dismiss}
          className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold text-center hover:opacity-90 transition cursor-pointer">
          View Loans
        </Link>
        <button onClick={dismiss}
          className="px-4 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer">
          Later
        </button>
      </div>
    </div>
  );
}
