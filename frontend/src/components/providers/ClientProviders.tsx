"use client";

import React from "react";
import { TenantProvider } from "@/contexts/TenantContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UpgradePaywallModal } from "@/components/subscription/UpgradePaywallModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { VersionNotifier } from "@/components/ui/VersionNotifier";
import { GlobalFloatingUI } from "@/components/ui/GlobalFloatingUI";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <SubscriptionProvider>
        <ErrorBoundary>
          <VersionNotifier />
          {children}
          <UpgradePaywallModal />
          <GlobalFloatingUI />
        </ErrorBoundary>
      </SubscriptionProvider>
    </TenantProvider>
  );
}

export default ClientProviders;
