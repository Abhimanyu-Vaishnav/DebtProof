/**
 * DebtProof — Multi-Tenant Context & Provider
 */
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Organization, Workspace, FeatureFlag, TenantRole } from "@/types/saas";
import { tenantsService } from "@/services/tenants.service";
import apiClient from "@/services/api";

interface TenantContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  featureFlags: FeatureFlag[];
  userRole: TenantRole;
  isLoading: boolean;
  setActiveOrganization: (org: Organization) => void;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshTenants: () => Promise<void>;
  isFeatureEnabled: (flagKey: string) => boolean;
}

const TenantContext = createContext<TenantContextType>({
  organizations: [],
  activeOrganization: null,
  workspaces: [],
  activeWorkspace: null,
  featureFlags: [],
  userRole: "member",
  isLoading: true,
  setActiveOrganization: () => {},
  setActiveWorkspace: () => {},
  refreshTenants: async () => {},
  isFeatureEnabled: () => true,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [userRole, setUserRole] = useState<TenantRole>("owner");
  const [isLoading, setIsLoading] = useState(true);

  const applyTenantHeaders = (orgId?: string, wsId?: string) => {
    if (typeof window === "undefined") return;
    if (orgId) {
      apiClient.defaults.headers.common["X-Organization-ID"] = orgId;
      localStorage.setItem("debtproof_active_org_id", orgId);
    } else {
      delete apiClient.defaults.headers.common["X-Organization-ID"];
    }

    if (wsId) {
      apiClient.defaults.headers.common["X-Workspace-ID"] = wsId;
      localStorage.setItem("debtproof_active_ws_id", wsId);
    } else {
      delete apiClient.defaults.headers.common["X-Workspace-ID"];
    }
  };

  const refreshTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const orgs = await tenantsService.getOrganizations();
      setOrganizations(orgs);

      if (orgs.length > 0) {
        const savedOrgId = typeof window !== "undefined" ? localStorage.getItem("debtproof_active_org_id") : null;
        const currentOrg = orgs.find((o) => o.id === savedOrgId) || orgs[0];
        setActiveOrganizationState(currentOrg);
        applyTenantHeaders(currentOrg.id);

        // Load workspaces for current org
        const wsList = currentOrg.workspaces || [];
        setWorkspaces(wsList);
        const savedWsId = typeof window !== "undefined" ? localStorage.getItem("debtproof_active_ws_id") : null;
        const currentWs = wsList.find((w) => w.id === savedWsId) || wsList[0] || null;
        setActiveWorkspaceState(currentWs);
        if (currentWs) applyTenantHeaders(currentOrg.id, currentWs.id);

        // Load feature flags
        const flags = await tenantsService.getFeatureFlags();
        setFeatureFlags(flags);
      }
    } catch {
      // Fallback default mock org if offline or initial setup
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("dp_access_token");
      if (!token) {
        setIsLoading(false);
        if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
          window.location.href = "/login";
        }
        return;
      }
    }
    refreshTenants();
  }, [refreshTenants]);

  const setActiveOrganization = (org: Organization) => {
    setActiveOrganizationState(org);
    const wsList = org.workspaces || [];
    setWorkspaces(wsList);
    const firstWs = wsList[0] || null;
    setActiveWorkspaceState(firstWs);
    applyTenantHeaders(org.id, firstWs?.id);
  };

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    if (activeOrganization) {
      applyTenantHeaders(activeOrganization.id, ws.id);
    }
  };

  const isFeatureEnabled = (flagKey: string): boolean => {
    const flag = featureFlags.find((f) => f.key === flagKey);
    return flag ? flag.is_enabled : true;
  };

  return (
    <TenantContext.Provider
      value={{
        organizations,
        activeOrganization,
        workspaces,
        activeWorkspace,
        featureFlags,
        userRole,
        isLoading,
        setActiveOrganization,
        setActiveWorkspace,
        refreshTenants,
        isFeatureEnabled,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
export default TenantProvider;
