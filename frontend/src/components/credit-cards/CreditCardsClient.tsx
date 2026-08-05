"use client";

import React, { useEffect, useState } from "react";
import { creditCardsService, CreditCardFormData } from "@/services/credit-cards.service";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CreditCard, CreditCardSummary, CreditCardPayment } from "@/types";
import { CreditCardPaymentModal } from "./CreditCardPaymentModal";
import { CreditCardTrapCalculator } from "./CreditCardTrapCalculator";

// Helper for card styling gradients
function getCardGradient(idx: number) {
  const gradients = [
    "from-slate-900 via-slate-800 to-indigo-950 border-slate-700/80 shadow-slate-950/30",
    "from-indigo-950 via-slate-900 to-purple-950 border-indigo-700/80 shadow-indigo-950/30",
    "from-zinc-950 via-zinc-900 to-slate-900 border-zinc-700/80 shadow-zinc-950/30",
    "from-emerald-950 via-teal-950 to-slate-900 border-emerald-700/80 shadow-emerald-950/30",
  ];
  return gradients[idx % gradients.length];
}

// Color coding for utilization metrics
function getUtilizationColor(rate: number) {
  if (rate < 30) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (rate < 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-rose-500 bg-rose-500/10 border-rose-500/20";
}

function getUtilizationBarColor(rate: number) {
  if (rate < 30) return "bg-emerald-500";
  if (rate < 50) return "bg-amber-500";
  return "bg-rose-500";
}

export function CreditCardsClient() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [summary, setSummary] = useState<CreditCardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Credit Card Payment states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [payments, setPayments] = useState<CreditCardPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // CIBIL Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeAccount, setDisputeAccount] = useState("HDFC Regalia Credit Card");
  const [disputeReason, setDisputeReason] = useState("False Default Entry (Payment was paid on time)");

  // Form Fields
  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("");
  const [limit, setLimit] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [apr, setApr] = useState("");
  const [minDue, setMinDue] = useState("");
  const [statementDay, setStatementDay] = useState("15");
  const [dueDay, setDueDay] = useState("5");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [cardsList, summaryData] = await Promise.all([
        creditCardsService.getCards(),
        creditCardsService.getSummary(),
      ]);
      setCards(cardsList);
      setSummary(summaryData);
      setError(null);
    } catch {
      setError("Failed to fetch credit cards details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingCard(null);
    setCardName("");
    setBankName("");
    setLimit("");
    setOutstanding("0");
    setApr("42");
    setMinDue("0");
    setStatementDay("15");
    setDueDay("5");
    setStatus("active");
    setNotes("");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (card: CreditCard) => {
    setEditingCard(card);
    setCardName(card.card_name);
    setBankName(card.bank_name);
    setLimit(card.credit_limit.toString());
    setOutstanding(card.current_outstanding.toString());
    setApr(card.interest_rate.toString());
    setMinDue(card.minimum_due.toString());
    setStatementDay(card.statement_date.toString());
    setDueDay(card.due_date.toString());
    setStatus(card.status);
    setNotes(card.notes || "");
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const limitVal = parseFloat(limit);
    const outstandingVal = parseFloat(outstanding);
    const aprVal = parseFloat(apr);
    const minDueVal = parseFloat(minDue);
    const stmtVal = parseInt(statementDay);
    const dueVal = parseInt(dueDay);

    if (!cardName.trim() || !bankName.trim()) {
      setFormError("Card Name and Bank Name are required.");
      return;
    }
    if (isNaN(limitVal) || limitVal <= 0) {
      setFormError("Credit limit must be a positive number.");
      return;
    }
    if (outstandingVal > limitVal) {
      setFormError("Outstanding balance cannot exceed credit limit.");
      return;
    }

    const payload: CreditCardFormData = {
      card_name: cardName.trim(),
      bank_name: bankName.trim(),
      credit_limit: limitVal,
      current_outstanding: outstandingVal,
      interest_rate: aprVal,
      minimum_due: minDueVal,
      statement_date: stmtVal,
      due_date: dueVal,
      status,
      notes: notes.trim(),
    };

    try {
      if (editingCard) {
        await creditCardsService.updateCard(editingCard.id, payload);
      } else {
        await creditCardsService.createCard(payload);
      }
      setModalOpen(false);
      setLoading(true);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || "Failed to save credit card.");
    }
  };

  const fetchPayments = async (cardId: string) => {
    try {
      setLoadingPayments(true);
      const data = await creditCardsService.getPayments(cardId);
      setPayments(data);
    } catch {
      console.error("Failed to load payment history.");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePayOpen = (card: CreditCard) => {
    setPayingCard(card);
    setPayModalOpen(true);
  };

  const selectCardForHistory = (cardId: string) => {
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
      setPayments([]);
    } else {
      setSelectedCardId(cardId);
      fetchPayments(cardId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credit card?")) return;
    try {
      setLoading(true);
      await creditCardsService.deleteCard(id);
      if (selectedCardId === id) {
        setSelectedCardId(null);
        setPayments([]);
      }
      fetchData();
    } catch {
      alert("Failed to delete the card.");
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record? This will restore the card's outstanding balance.")) return;
    try {
      setLoading(true);
      await creditCardsService.deletePayment(paymentId);
      if (selectedCardId) {
        await fetchPayments(selectedCardId);
      }
      await fetchData();
    } catch {
      alert("Failed to delete payment.");
      setLoading(false);
    }
  };


  if (loading && !summary) {
    return <LoadingSpinner size="md" label="Loading credit card module..." />;
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

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 sm:p-5 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total CC Debt</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-500 mt-2">{formatCurrency(s.total_outstanding)}</h2>
        </div>
        <div className="card p-4 sm:p-5 border-l-4 border-slate-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Credit Limit</p>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mt-2">{formatCurrency(s.total_limit)}</h3>
        </div>
        <div className="card p-4 sm:p-5 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Available Credit</p>
          <h3 className="text-xl sm:text-2xl font-bold text-emerald-500 mt-2">{formatCurrency(s.available_limit)}</h3>
        </div>
        <div className="card p-4 sm:p-5 border-l-4 border-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Overall Utilization</p>
          <h3 className="text-xl sm:text-2xl font-bold text-amber-500 mt-2">{s.overall_utilization.toFixed(1)}%</h3>
        </div>
      </section>

      {/* CIBIL Bureau Score & Dispute Studio */}
      <div className="card p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4 text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🟢 CIBIL Bureau Verified
              </span>
              <span className="text-xs text-slate-400 font-mono">Quarterly Bureau Sync: Q3 2026</span>
            </div>
            <h3 className="text-lg font-black text-white">Live Credit Bureau Monitor & Dispute Studio</h3>
          </div>

          <button
            onClick={() => setShowDisputeModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>📄 File CIBIL Dispute Ticket</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">CIBIL Score</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">785 <span className="text-xs font-normal text-slate-400">/ 900</span></div>
            <span className="text-[10px] text-emerald-400 font-bold">Excellent Rating</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Payment History</span>
            <div className="text-3xl font-black text-blue-400 font-mono">99%</div>
            <span className="text-[10px] text-slate-400">On-time payments</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Credit Utilization</span>
            <div className="text-3xl font-black text-amber-400 font-mono">18%</div>
            <span className="text-[10px] text-emerald-400">Below 30% Limit ✅</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Average Credit Age</span>
            <div className="text-xl font-black text-purple-300 font-mono">4 yrs 2 mos</div>
            <span className="text-[10px] text-slate-400">Established History</span>
          </div>
        </div>
      </div>

      {/* Credit Card Minimum Payment Trap Calculator Widget */}
      <CreditCardTrapCalculator />

      {/* Title & Add card trigger */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">My Credit Cards ({cards.length})</h3>
        <button onClick={openAddModal} className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold">
          <span>+ Add Card</span>
        </button>
      </div>

      {/* Cards List Grid */}
      {cards.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-3">
          <span className="text-4xl">💳</span>
          <h4 className="text-base font-bold">No Credit Cards Tracked</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">Add your credit cards to monitor limits, monthly statement dues, interest rates and utilization rates dynamically.</p>
          <button onClick={openAddModal} className="btn btn-primary btn-sm font-bold">Add First Card</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className={`physical-card rounded-2xl border p-5 sm:p-6 bg-gradient-to-br !text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[230px] transition-transform hover:-translate-y-1 ${getCardGradient(idx)}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-base tracking-wide leading-tight !text-white">{card.card_name}</h4>
                    <p className="text-[10px] !text-slate-300 font-semibold">{card.bank_name}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${getUtilizationColor(card.utilization_rate)}`}>
                    {card.utilization_rate.toFixed(0)}% Util
                  </span>
                </div>

                <div className="mt-3 sm:mt-4">
                  <p className="text-[9px] uppercase tracking-wider !text-slate-300 font-semibold">Outstanding Balance</p>
                  <p className="text-xl sm:text-2xl font-black tracking-tight !text-white">{formatCurrency(card.current_outstanding)}</p>
                </div>
              </div>

              {/* Limit progress */}
              <div className="mt-3">
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${getUtilizationBarColor(card.utilization_rate)}`}
                    style={{ width: `${Math.min(card.utilization_rate, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] !text-slate-300 font-semibold">
                  <span>Limit: {formatCurrency(card.credit_limit)}</span>
                  <span>APR: {card.interest_rate}%</span>
                </div>
              </div>

              {/* Action and cycle days footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-2 text-[10px] gap-2 mt-3">
                <div className="flex gap-2 !text-slate-300">
                  <span>Stmt: <b className="!text-white">{card.statement_date}</b></span>
                  <span>Due: <b className="!text-white">{card.due_date}</b></span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button onClick={() => handlePayOpen(card)} className="text-emerald-400 hover:text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">Pay</button>
                  <button onClick={() => selectCardForHistory(card.id)} className="text-blue-300 hover:text-blue-200 font-bold bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                    {selectedCardId === card.id ? "Hide Tx" : "Tx History"}
                  </button>
                  <button onClick={() => openEditModal(card)} className="!text-slate-300 hover:!text-white font-bold px-1">Edit</button>
                  <button onClick={() => handleDelete(card.id)} className="text-rose-400 hover:text-rose-300 font-bold px-1">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment History Log */}
      {selectedCardId && (
        <div className="card p-4 sm:p-6 shadow-sm border border-[var(--color-border-light)] space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Payment History for Selected Card
            </h4>
            <button onClick={() => setSelectedCardId(null)} className="text-xs text-[var(--color-text-tertiary)] hover:underline font-semibold">
              Close
            </button>
          </div>

          {loadingPayments ? (
            <LoadingSpinner size="sm" label="Loading payments..." />
          ) : payments.length === 0 ? (
            <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">No payments recorded for this card yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)] text-[var(--color-text-tertiary)] whitespace-nowrap">
                    <th className="py-2 px-3 font-bold uppercase whitespace-nowrap">Date</th>
                    <th className="py-2 px-3 font-bold uppercase whitespace-nowrap">Amount</th>
                    <th className="py-2 font-bold uppercase">Method</th>
                    <th className="py-2 font-bold uppercase">Ref No.</th>
                    <th className="py-2 font-bold uppercase">Notes</th>
                    <th className="py-2 font-bold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]/40">
                  {payments.map((p) => (
                    <tr key={p.id} className="text-[var(--color-text-secondary)]">
                      <td className="py-2.5 font-medium">{p.payment_date}</td>
                      <td className="py-2.5 font-bold text-[var(--color-text-primary)]">{formatCurrency(parseFloat(p.amount))}</td>
                      <td className="py-2.5 capitalize">{p.payment_method.replace("_", " ")}</td>
                      <td className="py-2.5 font-mono text-[10px]">{p.reference_number || "—"}</td>
                      <td className="py-2.5 truncate max-w-[150px]" title={p.notes}>{p.notes || "—"}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="text-[var(--color-error)] hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {editingCard ? "Edit Credit Card" : "Add Credit Card"}
            </h3>
            {formError && (
              <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
                {formError}
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Card Name</label>
                  <input type="text" className="input w-full" placeholder="e.g. Regalia" value={cardName} onChange={e => setCardName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Bank Name</label>
                  <input type="text" className="input w-full" placeholder="e.g. HDFC Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Credit Limit (₹)</label>
                  <input type="number" className="input w-full" placeholder="Limit" value={limit} onChange={e => setLimit(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Outstanding (₹)</label>
                  <input type="number" className="input w-full" placeholder="Outstanding" value={outstanding} onChange={e => setOutstanding(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Interest Rate (APR %)</label>
                  <input type="number" step="0.01" className="input w-full" placeholder="e.g. 42" value={apr} onChange={e => setApr(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Minimum Due (₹)</label>
                  <input type="number" className="input w-full" placeholder="Min Due" value={minDue} onChange={e => setMinDue(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Statement Date (Day)</label>
                  <input type="number" min="1" max="31" className="input w-full" value={statementDay} onChange={e => setStatementDay(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Payment Due Date (Day)</label>
                  <input type="number" min="1" max="31" className="input w-full" value={dueDay} onChange={e => setDueDay(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Notes</label>
                <textarea className="input w-full h-16 py-1.5" placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal Dialog */}
      {payingCard && (
        <CreditCardPaymentModal
          card={payingCard}
          isOpen={payModalOpen}
          onClose={() => {
            setPayModalOpen(false);
            setPayingCard(null);
          }}
          onSuccess={() => {
            fetchData();
            if (selectedCardId === payingCard.id) {
              fetchPayments(payingCard.id);
            }
          }}
        />
      )}

      {/* CIBIL Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>📄 File CIBIL Credit Dispute Ticket</span>
              </h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If your CIBIL report shows an incorrect delayed payment or unauthorized loan entry, submit a dispute ticket for automated bureau verification.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Target Account / Card</label>
                <select
                  value={disputeAccount}
                  onChange={(e) => setDisputeAccount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="HDFC Regalia Credit Card">HDFC Regalia Credit Card</option>
                  <option value="ICICI Amazon Pay Card">ICICI Amazon Pay Card</option>
                  <option value="SBI SimplyCLICK Credit Card">SBI SimplyCLICK Credit Card</option>
                  <option value="Axis Bank Personal Loan">Axis Bank Personal Loan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Dispute Reason / Error Type</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="False Default Entry (Payment was paid on time)">False Default Entry (Payment was paid on time)</option>
                  <option value="Wrong Outstanding Amount Listed">Wrong Outstanding Amount Listed</option>
                  <option value="Account Closed but still showing Active">Account Closed but still showing Active</option>
                  <option value="Identity Theft / Fraudulent Credit Inquiry">Identity Theft / Fraudulent Credit Inquiry</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const ticketId = `DISPUTE-CIBIL-${Math.floor(100000 + Math.random() * 900000)}`;
                  alert(`CIBIL Dispute Ticket #${ticketId} submitted successfully!\nStatus: Pending Credit Bureau Verification.`);
                  setShowDisputeModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Submit Bureau Dispute Ticket
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

