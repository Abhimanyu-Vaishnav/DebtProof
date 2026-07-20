"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, subDays, subMonths, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { BarChartIcon, LineChartIcon, PieChartIcon, CalendarIcon } from "lucide-react";
import apiClient from "@/services/api";
import { AdvancedChart, ChartType } from "./AdvancedChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type TimeRange = "7d" | "30d" | "6m" | "custom";

export function InteractiveChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawPayments, setRawPayments] = useState<any[]>([]);

  useEffect(() => {
    if (timeRange !== "custom") {
      fetchData();
    }
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let start = "";
      let end = format(new Date(), "yyyy-MM-dd");
      const today = new Date();
      
      if (timeRange === "7d") start = format(subDays(today, 6), "yyyy-MM-dd");
      else if (timeRange === "30d") start = format(subDays(today, 29), "yyyy-MM-dd");
      else if (timeRange === "6m") start = format(subMonths(today, 5), "yyyy-MM-dd");
      else if (timeRange === "custom") {
        if (!customStart || !customEnd) {
          setLoading(false);
          return;
        }
        start = customStart;
        end = customEnd;
      }

      const res = await apiClient.get("payments/export/csv/", {
        params: { format: "json", start_date: start, end_date: end }
      });
      
      if (res.data && res.data.payments) {
        setRawPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to fetch chart data", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (chartType === "pie") {
      const map = new Map<string, number>();
      rawPayments.forEach(p => {
        const name = p.loan_type ? p.loan_type : "Other";
        map.set(name, (map.get(name) || 0) + p.amount);
      });
      return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }

    // Time series (Bar/Line)
    const today = new Date();
    let isDaily = timeRange === "7d" || timeRange === "30d";
    
    if (timeRange === "custom" && customStart && customEnd) {
      const diff = differenceInDays(parseISO(customEnd), parseISO(customStart));
      isDaily = diff <= 60;
    }

    const dataMap = new Map<string, { total: number; count: number }>();

    // Pre-fill dates to ensure continuous axis
    if (isDaily) {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : differenceInDays(parseISO(customEnd), parseISO(customStart)) + 1;
      const endD = timeRange === "custom" ? parseISO(customEnd) : today;
      
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(endD, i);
        dataMap.set(format(d, "MMM dd"), { total: 0, count: 0 });
      }
    } else {
      const months = timeRange === "6m" ? 6 : Math.ceil(differenceInDays(parseISO(customEnd), parseISO(customStart)) / 30) + 1;
      const endD = timeRange === "custom" ? parseISO(customEnd) : today;
      
      for (let i = months - 1; i >= 0; i--) {
        const d = subMonths(endD, i);
        dataMap.set(format(d, "MMM yyyy"), { total: 0, count: 0 });
      }
    }

    // Aggregate
    rawPayments.forEach(p => {
      if (!p.payment_date) return;
      
      const date = parseISO(p.payment_date);
      const key = isDaily ? format(date, "MMM dd") : format(date, "MMM yyyy");
      
      if (dataMap.has(key)) {
        const curr = dataMap.get(key)!;
        curr.total += p.amount;
        curr.count += 1;
      }
    });

    return Array.from(dataMap.entries()).map(([date, stats]) => ({
      date,
      total: stats.total,
      count: stats.count
    }));
  }, [rawPayments, chartType, timeRange, customStart, customEnd]);

  return (
    <div className="card p-6 shadow-sm border border-[var(--color-border-light)] flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          Payment Trends
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-[var(--color-surface-secondary)] p-1 rounded-xl">
            {(["7d", "30d", "6m", "custom"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  timeRange === range
                    ? "bg-[var(--color-surface-primary)] text-[var(--color-primary)] shadow-sm"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "6m" ? "6 Months" : "Custom"}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-[var(--color-surface-secondary)] p-1 rounded-xl">
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg transition-colors ${chartType === "bar" ? "bg-[var(--color-surface-primary)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
              title="Bar Chart"
            >
              <BarChartIcon size={16} />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-1.5 rounded-lg transition-colors ${chartType === "line" ? "bg-[var(--color-surface-primary)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
              title="Line Chart"
            >
              <LineChartIcon size={16} />
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`p-1.5 rounded-lg transition-colors ${chartType === "pie" ? "bg-[var(--color-surface-primary)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"}`}
              title="Pie Chart"
            >
              <PieChartIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {timeRange === "custom" && (
        <div className="flex items-end gap-3 bg-[var(--color-surface-secondary)] p-4 rounded-xl border border-[var(--color-border-light)]">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">Start Date</label>
            <input type="date" className="input text-xs h-9 w-full" value={customStart} onChange={e => setCustomStart(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">End Date</label>
            <input type="date" className="input text-xs h-9 w-full" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </div>
          <button onClick={fetchData} disabled={loading || !customStart || !customEnd} className="btn btn-primary h-9 px-4 text-xs">
            Apply
          </button>
        </div>
      )}

      <div className="relative min-h-[350px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-primary)] bg-opacity-70 z-10 rounded-xl">
            <LoadingSpinner label="Loading chart data..." />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] rounded-xl border border-dashed border-[var(--color-border-light)]">
            <CalendarIcon size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-semibold">No payments found in this date range.</p>
          </div>
        ) : null}
        
        <div className={loading ? "opacity-30 pointer-events-none" : ""}>
          <AdvancedChart 
            data={chartData} 
            type={chartType} 
            xKey={chartType === "pie" ? "name" : "date"} 
            yKey={chartType === "pie" ? "value" : "total"} 
          />
        </div>
      </div>
    </div>
  );
}
