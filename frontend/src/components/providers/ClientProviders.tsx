"use client";

import React from "react";
import { TenantProvider } from "@/contexts/TenantContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { VersionNotifier } from "@/components/ui/VersionNotifier";
import { GlobalFloatingUI } from "@/components/ui/GlobalFloatingUI";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <ErrorBoundary>
        <VersionNotifier />
        {children}
        <GlobalFloatingUI />
      </ErrorBoundary>
    </TenantProvider>
  );
}

export default ClientProviders;
