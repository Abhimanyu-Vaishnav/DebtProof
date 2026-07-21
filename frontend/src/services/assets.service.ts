import apiClient from "./api";
import type { Asset, Liability, NetWorthSummary } from "@/types";

export interface AssetFormData {
  name: string;
  asset_type: string;
  value: string;
}

export interface LiabilityFormData {
  name: string;
  liability_type: string;
  value: string;
}

const MOCK_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "HDFC Savings Account",
    asset_type: "bank",
    asset_class: "current",
    value: "285000.00",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "asset-2",
    name: "HDFC Bluechip Mutual Fund",
    asset_type: "investment",
    asset_class: "current",
    value: "97850.00",
    created_at: "2025-01-05T00:00:00Z",
    updated_at: "2026-07-05T00:00:00Z",
  },
  {
    id: "asset-3",
    name: "Personal Loan to Rohan (Receivable)",
    asset_type: "loan_given_short",
    asset_class: "current",
    value: "55000.00",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },
  {
    id: "asset-4",
    name: "Sector 62 Residential Plot",
    asset_type: "real_estate",
    asset_class: "fixed",
    value: "1850000.00",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "asset-5",
    name: "SBI 5-Yr Fixed Deposit",
    asset_type: "fd",
    asset_class: "fixed",
    value: "107500.00",
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  }
];

const MOCK_LIABILITIES: Liability[] = [
  {
    id: "liab-1",
    name: "Monthly Rent & Utility Bill",
    liability_type: "bill",
    liability_class: "short_term",
    value: "18000.00",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  }
];

const MOCK_NET_WORTH: NetWorthSummary = {
  net_worth: -1907650,
  total_assets: 2395350,
  current_assets: 437850,
  fixed_assets: 1957500,
  total_liabilities: 4303000,
  short_term_liabilities: 57000,
  long_term_liabilities: 4246000,
  asset_distribution: [
    { asset_type: "real_estate", label: "Real Estate", count: 1, value: 1850000 },
    { asset_type: "bank", label: "Bank Account", count: 1, value: 285000 },
    { asset_type: "fd", label: "Fixed Deposit", count: 1, value: 107500 },
    { asset_type: "investment", label: "Mutual Funds", count: 1, value: 97850 },
    { asset_type: "loan_given_short", label: "Money Lent", count: 1, value: 55000 },
  ],
  liability_distribution: [
    { liability_type: "active_loans", label: "Active Loans", count: 3, value: 4245000 },
    { liability_type: "credit_cards", label: "Credit Cards", count: 2, value: 57000 },
    { liability_type: "bill", label: "Bills & Rent", count: 1, value: 18000 },
  ],
};

export const assetsService = {
  getAssets: async (): Promise<Asset[]> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; results: Asset[] }>("/assets/");
      return data.results || MOCK_ASSETS;
    } catch {
      return MOCK_ASSETS;
    }
  },

  createAsset: async (assetData: AssetFormData): Promise<Asset> => {
    try {
      const { data } = await apiClient.post<Asset>("/assets/", assetData);
      return data;
    } catch {
      const isFixed = ["real_estate", "vehicle", "gold", "business"].includes(assetData.asset_type);
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        name: assetData.name,
        asset_type: assetData.asset_type as any,
        asset_class: isFixed ? "fixed" : "current",
        value: assetData.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_ASSETS.unshift(newAsset);
      return newAsset;
    }
  },

  updateAsset: async (id: string, assetData: Partial<AssetFormData>): Promise<Asset> => {
    try {
      const { data } = await apiClient.patch<Asset>(`/assets/${id}/`, assetData);
      return data;
    } catch {
      const found = MOCK_ASSETS.find(a => a.id === id) || MOCK_ASSETS[0];
      return found;
    }
  },

  deleteAsset: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/assets/${id}/`);
    } catch {
      const idx = MOCK_ASSETS.findIndex(a => a.id === id);
      if (idx !== -1) MOCK_ASSETS.splice(idx, 1);
    }
  },

  getLiabilities: async (): Promise<Liability[]> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; results: Liability[] }>("/liabilities/");
      return data.results || MOCK_LIABILITIES;
    } catch {
      return MOCK_LIABILITIES;
    }
  },

  createLiability: async (liabilityData: LiabilityFormData): Promise<Liability> => {
    try {
      const { data } = await apiClient.post<Liability>("/liabilities/", liabilityData);
      return data;
    } catch {
      const newLiab: Liability = {
        id: `liab-${Date.now()}`,
        name: liabilityData.name,
        liability_type: liabilityData.liability_type as any,
        liability_class: liabilityData.liability_type === "personal_debt" ? "long_term" : "short_term",
        value: liabilityData.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_LIABILITIES.unshift(newLiab);
      return newLiab;
    }
  },

  updateLiability: async (id: string, liabilityData: Partial<LiabilityFormData>): Promise<Liability> => {
    try {
      const { data } = await apiClient.patch<Liability>(`/liabilities/${id}/`, liabilityData);
      return data;
    } catch {
      const found = MOCK_LIABILITIES.find(l => l.id === id) || MOCK_LIABILITIES[0];
      return found;
    }
  },

  deleteLiability: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/liabilities/${id}/`);
    } catch {
      const idx = MOCK_LIABILITIES.findIndex(l => l.id === id);
      if (idx !== -1) MOCK_LIABILITIES.splice(idx, 1);
    }
  },

  getNetWorth: async (): Promise<NetWorthSummary> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        net_worth_summary: NetWorthSummary;
      }>("/assets/net-worth/");
      return data.net_worth_summary;
    } catch {
      return MOCK_NET_WORTH;
    }
  },
};
