"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { EMIEvent, CalendarData, CalendarMonthSummary } from "@/types";
import { LOAN_TYPE_LABELS } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────────
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Status helpers ─────────────────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "paid") return "bg-emerald-500";
  if (status === "overdue") return "bg-rose-500";
  return "bg-blue-500";
}

function statusBadge(status: string) {
  if (status === "paid") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "overdue") return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  return "bg-blue-500/10 text-blue-500 border-blue-500/20";
}

function statusLabel(status: string) {
  if (status === "paid") return "Paid";
  if (status === "overdue") return "Overdue";
  return "Upcoming";
}

// ── Agenda Event Card ──────────────────────────────────────────────────────────
function AgendaCard({ event }: { event: EMIEvent }) {
  return (
    <Link
      href={`/dashboard/loans/${event.loan_id}`}
      className="block p-3 rounded-xl border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)] hover:-translate-y-0.5 transition-all bg-[var(--color-surface-secondary)] group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary-light)] transition-colors">
            {event.loan_name}
          </p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">{event.lender_name}</p>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge(event.status)}`}>
          {statusLabel(event.status)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-surface-tertiary)] px-2 py-0.5 rounded-full">
          {LOAN_TYPE_LABELS[event.loan_type as keyof typeof LOAN_TYPE_LABELS] ?? event.loan_type}
        </span>
        <span className="text-sm font-bold text-[var(--color-text-primary)]">
          {formatCurrency(event.emi_amount)}
        </span>
      </div>
    </Link>
  );
}

// ── Summary Bar ───────────────────────────────────────────────────────────────
function SummaryBar({ summary, year, month }: { summary: CalendarMonthSummary; year: number; month: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="card p-4 border-l-4 border-[var(--color-primary)]">
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-wider">Total EMI Due</p>
        <p className="text-xl font-extrabold text-[var(--color-text-primary)] mt-1">{formatCurrency(summary.total_emi)}</p>
        <p className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">{MONTH_NAMES[month - 1]} {year}</p>
      </div>
      <div className="card p-4 border-l-4 border-blue-500">
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-wider">Upcoming</p>
        <p className="text-xl font-extrabold text-blue-500 mt-1">{summary.upcoming_count}</p>
        <p className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">payments due</p>
      </div>
      <div className="card p-4 border-l-4 border-rose-500">
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-wider">Overdue</p>
        <p className="text-xl font-extrabold text-rose-500 mt-1">{summary.overdue_count}</p>
        <p className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">need attention</p>
      </div>
      <div className="card p-4 border-l-4 border-emerald-500">
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-wider">Paid</p>
        <p className="text-xl font-extrabold text-emerald-500 mt-1">{summary.paid_count}</p>
        <p className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">this month</p>
      </div>
    </div>
  );
}

// ── Calendar Grid ─────────────────────────────────────────────────────────────
function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  events: EMIEvent[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const today = new Date();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build events-by-day map
  const eventsByDay: Record<number, EMIEvent[]> = {};
  for (const event of events) {
    const day = parseInt(event.due_date.split("-")[2], 10);
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(event);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;

  return (
    <div className="card p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} className="min-h-[46px] sm:min-h-[64px] rounded-lg" />;
          const dayEvents = eventsByDay[day] || [];
          const hasOverdue = dayEvents.some(e => e.status === "overdue");
          const hasPaid = dayEvents.some(e => e.status === "paid");
          const hasUpcoming = dayEvents.some(e => e.status === "upcoming");
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`min-h-[46px] sm:min-h-[64px] rounded-xl flex flex-col items-center justify-start pt-1 sm:pt-1.5 gap-0.5 sm:gap-1 transition-all border text-left p-0.5 sm:px-1 cursor-pointer
                ${isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : isToday(day)
                    ? "border-[var(--color-primary-light)] bg-[var(--color-primary-light)]/5"
                    : "border-transparent hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-secondary)]"
                }`}
            >
              <span className={`text-[10px] sm:text-xs font-bold leading-none
                ${isToday(day) ? "text-[var(--color-primary-light)]" : "text-[var(--color-text-secondary)]"}`}>
                {day}
              </span>
              {/* Status dots */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  {hasUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {hasPaid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </div>
              )}
              {/* EMI count badge */}
              {dayEvents.length > 0 && (
                <span className={`text-[7px] sm:text-[8px] font-bold px-1 rounded-full leading-tight hidden xs:inline-block ${
                  hasOverdue ? "bg-rose-500/20 text-rose-500" :
                  hasPaid ? "bg-emerald-500/20 text-emerald-500" :
                  "bg-blue-500/20 text-blue-500"
                }`}>
                  {dayEvents.length} EMI
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function CalendarClient() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loansService.getCalendar(year, month);
      setCalendarData(data);
    } catch {
      setError("Failed to load EMI calendar.");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDay(today.getDate());
  };

  // Events for selected day or all events if no day selected
  const events = calendarData?.events ?? [];
  const selectedEvents = selectedDay
    ? events.filter(e => parseInt(e.due_date.split("-")[2], 10) === selectedDay)
    : events;

  return (
    <div className="space-y-5">
      {/* ── Month Navigator ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center hover:bg-[var(--color-surface-tertiary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center hover:bg-[var(--color-surface-tertiary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button onClick={goToToday} className="btn btn-secondary btn-sm">Today</button>
      </div>

      {/* ── Summary Bar ─────────────────────────────────── */}
      {calendarData && (
        <SummaryBar summary={calendarData.month_summary} year={year} month={month} />
      )}

      {/* ── Main Grid + Agenda ───────────────────────────── */}
      {loading ? (
        <LoadingSpinner size="md" label="Loading calendar..." />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--color-error)] mb-3">{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchCalendar}>Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Calendar grid — takes 2 cols */}
          <div className="lg:col-span-2">
            <CalendarGrid
              year={year}
              month={month}
              events={events}
              selectedDay={selectedDay}
              onSelectDay={(d) => setSelectedDay(prev => prev === d ? null : d)}
            />

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 pl-1">
              {[
                { color: "bg-rose-500", label: "Overdue" },
                { color: "bg-blue-500", label: "Upcoming" },
                { color: "bg-emerald-500", label: "Paid" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda sidebar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                {selectedDay ? `${MONTH_NAMES[month - 1]} ${selectedDay}` : "All Events"}
              </h3>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="text-[10px] text-[var(--color-primary-light)] hover:underline">
                  Show all
                </button>
              )}
            </div>
            <div className="space-y-2">
              {selectedEvents.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-2xl mb-2">📅</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {selectedDay ? "No EMIs due on this day." : "No active loans this month."}
                  </p>
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <AgendaCard key={`${event.loan_id}-${event.due_date}`} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
