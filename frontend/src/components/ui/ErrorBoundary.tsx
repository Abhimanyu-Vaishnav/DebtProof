"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by DebtProof ErrorBoundary:", error, errorInfo);
    if (typeof window !== "undefined" && (error?.message?.includes("Element type is invalid") || error?.message?.includes("stale"))) {
      // Auto-recover from stale Webpack HMR chunk resolution without requiring user history deletion
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 300);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl m-4">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto font-bold shadow-inner">
              ⚡
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--color-text-primary)]">
                UI State Recovered Cleanly
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                A temporary runtime exception occurred. DebtProof automatically caught the error so your app session remains safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-950/80 text-rose-400 border border-rose-500/30 text-[11px] font-mono text-left truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-2"
              >
                <span>🔄 Reload Fresh State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
