"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { CustomCSVExcelExportEngine } from "@/components/reports/CustomCSVExcelExportEngine";
import { NoDuesCertificateGenerator } from "@/components/reports/NoDuesCertificateGenerator";
import TaxExportStudio from "@/components/reports/TaxExportStudio";

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports & Export" subtitle="Download structured CSV/JSON logs of your debts and payment history" />
      <main className="page-content space-y-6">
        <NoDuesCertificateGenerator />
        <TaxExportStudio />
        
        {/* Section 24(b) Home Loan Income Tax Certificate Generator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                📄
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  Section 24(b) & 80C Income Tax Exemption Certificate Exporter
                </h3>
                <p className="text-xs text-slate-400">
                  Export official tax exemption statement for FY 2025–26 home loan principal & interest deductions
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              🖨️ Export Tax Exemption PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-slate-400">Total Interest Deductible (Sec 24b)</span>
              <p className="text-xl font-bold text-amber-400">₹2,00,000</p>
              <span className="text-[10px] text-emerald-400">Max limit utilized</span>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-slate-400">Principal Repayment (Sec 80C)</span>
              <p className="text-xl font-bold text-emerald-400">₹1,50,000</p>
              <span className="text-[10px] text-slate-400">Section 80C rebate</span>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-slate-400">Total Tax Exemption Benefit</span>
              <p className="text-xl font-bold text-purple-400">₹3,50,000</p>
              <span className="text-[10px] text-purple-300">Annual Tax Savings</span>
            </div>
          </div>
        </div>

        <CustomCSVExcelExportEngine />
        <ReportsClient />
      </main>
    </>
  );
}
