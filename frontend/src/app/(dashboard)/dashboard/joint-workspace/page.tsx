"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { JointWorkspaceStudio } from "@/components/joint-workspace/JointWorkspaceStudio";
import { FeatureGate } from "@/components/subscription/FeatureGate";

export default function JointWorkspacePage() {
  return (
    <>
      <Topbar
        title="Joint Co-Borrower Workspace"
        subtitle="Manage co-signed liabilities & joint Web3 multi-sig approvals"
      />

      <main className="page-content space-y-6 pb-12">
        {/* Top Banner */}
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                👥 Joint Borrowers & Co-Signers
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Multi-Sig Workspace</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              Shared Joint Loan & Co-Borrower Workspace
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Manage joint home loans, co-signed education liabilities, and shared business accounts with your spouse or partner. Customize monthly EMI split ratios, track individual payment contributions, and execute multi-signature contract sign-offs on the Monad Blockchain.
            </p>
          </div>
        </div>

        {/* Main Joint Workspace Studio Component */}
        <FeatureGate featureKey="joint_workspace" featureName="Joint Co-Borrower Workspace" description="Joint Workspace & Family Sharing requires a Premium or Business subscription plan. Upgrade to collaborate on co-signed loans with your spouse or family.">
          <JointWorkspaceStudio />
        </FeatureGate>
      </main>
    </>
  );
}
