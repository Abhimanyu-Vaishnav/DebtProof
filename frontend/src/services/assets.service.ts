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

export const assetsService = {
  /**
   * Get all assets for the authenticated user.
   */
  getAssets: async (): Promise<Asset[]> => {
    const { data } = await apiClient.get<{ success: boolean; results: Asset[] }>("/assets/");
    return data.results || [];
  },

  /**
   * Create a new asset.
   */
  createAsset: async (assetData: AssetFormData): Promise<Asset> => {
    const { data } = await apiClient.post<Asset>("/assets/", assetData);
    return data;
  },

  /**
   * Update an existing asset.
   */
  updateAsset: async (id: string, assetData: Partial<AssetFormData>): Promise<Asset> => {
    const { data } = await apiClient.patch<Asset>(`/assets/${id}/`, assetData);
    return data;
  },

  /**
   * Delete an asset.
   */
  deleteAsset: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}/`);
  },

  /**
   * Get all custom liabilities for the authenticated user.
   */
  getLiabilities: async (): Promise<Liability[]> => {
    const { data } = await apiClient.get<{ success: boolean; results: Liability[] }>("/liabilities/");
    return data.results || [];
  },

  /**
   * Create a new custom liability.
   */
  createLiability: async (liabilityData: LiabilityFormData): Promise<Liability> => {
    const { data } = await apiClient.post<Liability>("/liabilities/", liabilityData);
    return data;
  },

  /**
   * Update an existing custom liability.
   */
  updateLiability: async (id: string, liabilityData: Partial<LiabilityFormData>): Promise<Liability> => {
    const { data } = await apiClient.patch<Liability>(`/liabilities/${id}/`, liabilityData);
    return data;
  },

  /**
   * Delete a custom liability.
   */
  deleteLiability: async (id: string): Promise<void> => {
    await apiClient.delete(`/liabilities/${id}/`);
  },

  /**
   * Get Net Worth summary statistics.
   */
  getNetWorth: async (): Promise<NetWorthSummary> => {
    const { data } = await apiClient.get<{
      success: boolean;
      net_worth_summary: NetWorthSummary;
    }>("/assets/net-worth/");
    return data.net_worth_summary;
  },
};
