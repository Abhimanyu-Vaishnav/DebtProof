"use client";

import React, { useEffect, useState } from "react";
import { creditCardsService, CreditCardFormData } from "@/services/credit-cards.service";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { CreditCard, CreditCardSummary, CreditCardPayment } from "@/types";
import { CreditCardPaymentModal } from "./CreditCardPaymentModal";

// Helper for card styling gradients
function getCardGradient(idx: number) {
  const gradients = [
    "from-slate-900 to-slate-800 border-slate-700",
    "from-indigo-950 to-indigo-900 border-indigo-800",
    "from-zinc-900 to-zinc-800 border-zinc-700",
    "from-emerald-950 to-emerald-900 border-emerald-800",
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
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-rose-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total CC Debt</p>
          <h2 className="text-3xl font-extrabold text-rose-500 mt-2">{formatCurrency(s.total_outstanding)}</h2>
        </div>
        <div className="card p-5 border-l-4 border-slate-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Total Credit Limit</p>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">{formatCurrency(s.total_limit)}</h3>
        </div>
        <div className="card p-5 border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Available Credit</p>
          <h3 className="text-2xl font-bold text-emerald-500 mt-2">{formatCurrency(s.available_limit)}</h3>
        </div>
        <div className="card p-5 border-l-4 border-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Overall Utilization</p>
          <h3 className="text-2xl font-bold text-amber-500 mt-2">{s.overall_utilization.toFixed(1)}%</h3>
        </div>
      </section>

      {/* Title & Add card trigger */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">My Credit Cards ({cards.length})</h3>
        <button onClick={openAddModal} className="btn btn-primary btn-sm flex items-center gap-1.5">
          <span>+ Add Card</span>
        </button>
      </div>

      {/* Cards List Grid */}
      {cards.length === 0 ? (
        <div className="card p-12 text-center max-w-xl mx-auto space-y-3">
          <span className="text-4xl">💳</span>
          <h4 className="text-base font-bold">No Credit Cards Tracked</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">Add your credit cards to monitor limits, monthly statement dues, interest rates and utilization rates dynamically.</p>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">Add First Card</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className={`rounded-2xl border p-6 bg-gradient-to-br text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-56 transition-transform hover:-translate-y-1 ${getCardGradient(idx)}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-base tracking-wide leading-tight">{card.card_name}</h4>
                    <p className="text-[10px] text-slate-300 font-semibold">{card.bank_name}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getUtilizationColor(card.utilization_rate)}`}>
                    {card.utilization_rate.toFixed(0)}% Util
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[9px] uppercase tracking-wider text-slate-300 font-semibold">Outstanding Balance</p>
                  <p className="text-2xl font-black tracking-tight text-white">{formatCurrency(card.current_outstanding)}</p>
                </div>
              </div>

              {/* Limit progress */}
              <div>
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${getUtilizationBarColor(card.utilization_rate)}`}
                    style={{ width: `${Math.min(card.utilization_rate, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-300 font-semibold">
                  <span>Limit: {formatCurrency(card.credit_limit)}</span>
                  <span>APR: {card.interest_rate}%</span>
                </div>
              </div>

              {/* Action and cycle days footer */}
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 text-[10px]">
                <div className="flex gap-2.5">
                  <span>Stmt: <b>{card.statement_date}</b></span>
                  <span>Due: <b>{card.due_date}</b></span>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={() => handlePayOpen(card)} className="text-emerald-400 hover:text-emerald-300 font-bold bg-slate-800/60 px-2 py-0.5 rounded">Pay</button>
                  <button onClick={() => selectCardForHistory(card.id)} className="text-blue-300 hover:text-blue-200 font-bold bg-slate-800/60 px-2 py-0.5 rounded">
                    {selectedCardId === card.id ? "Hide Tx" : "Tx History"}
                  </button>
                  <button onClick={() => openEditModal(card)} className="text-slate-300 hover:text-white font-bold">Edit</button>
                  <button onClick={() => handleDelete(card.id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment History Log */}
      {selectedCardId && (
        <div className="card p-6 shadow-sm border border-[var(--color-border-light)] space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Payment History for Selected Card
            </h4>
            <button onClick={() => setSelectedCardId(null)} className="text-xs text-[var(--color-text-tertiary)] hover:underline">
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
                  <tr className="border-b border-[var(--color-border-light)] text-[var(--color-text-tertiary)]">
                    <th className="py-2 font-bold uppercase">Date</th>
                    <th className="py-2 font-bold uppercase">Amount</th>
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
    </div>
  );
}

