"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";

export type ChartType = "bar" | "line" | "pie";

interface AdvancedChartProps {
  data: any[];
  type: ChartType;
  xKey: string;
  yKey: string;
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

export function AdvancedChart({ data, type, xKey, yKey }: AdvancedChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-surface-inverse)] text-[var(--color-text-inverse)] p-3 rounded-xl shadow-xl border border-white/10">
          <p className="font-bold mb-1">{label || payload[0].name}</p>
          <p className="text-lg font-black text-[var(--color-accent)]">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.count !== undefined && (
            <p className="text-xs opacity-70 mt-1">
              {payload[0].payload.count} payment{payload[0].payload.count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (type === "pie") {
    const pieData = data.filter((d) => d[yKey] > 0);
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey={yKey}
            nameKey={xKey}
            stroke="none"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border-light)", strokeWidth: 2, strokeDasharray: "5 5" }} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke="var(--color-primary)" 
            strokeWidth={4}
            dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 8, strokeWidth: 0, fill: "var(--color-accent)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
        <XAxis 
          dataKey={xKey} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "var(--color-text-tertiary)", fontSize: 12 }}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-surface-hover)" }} />
        <Bar 
          dataKey={yKey} 
          fill="var(--color-primary)" 
          radius={[6, 6, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
