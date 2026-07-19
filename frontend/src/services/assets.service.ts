import apiClient from "./api";
import type { Asset, NetWorthSummary } from "@/types";

export interface AssetFormData {
  name: string;
  asset_type: string;
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
