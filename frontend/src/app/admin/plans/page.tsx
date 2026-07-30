"use client";

import { useEffect } from "react";

export default function AdminPlansRedirectPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-400">Redirecting to Super Admin Portal...</p>
    </div>
  );
}
