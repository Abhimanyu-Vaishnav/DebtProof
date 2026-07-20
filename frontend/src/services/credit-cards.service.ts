import apiClient from "./api";
import type { CreditCard, CreditCardSummary } from "@/types";

export interface CreditCardFormData {
  card_name: string;
  bank_name: string;
  credit_limit: number;
  current_outstanding: number;
  interest_rate: number;
  minimum_due: number;
  statement_date: number;
  due_date: number;
  status?: string;
  notes?: string;
}

export const creditCardsService = {
  /**
   * Get all credit cards for the current user.
   */
  getCards: async (): Promise<CreditCard[]> => {
    const { data } = await apiClient.get<{ success: boolean; results: CreditCard[] }>("/credit-cards/");
    return data.results || [];
  },

  /**
   * Get overall credit card summary calculations.
   */
  getSummary: async (): Promise<CreditCardSummary> => {
    const { data } = await apiClient.get<CreditCardSummary>("/credit-cards/summary/");
    return data;
  },

  /**
   * Create a new credit card.
   */
  createCard: async (cardData: CreditCardFormData): Promise<CreditCard> => {
    const { data } = await apiClient.post<CreditCard>("/credit-cards/", cardData);
    return data;
  },

  /**
   * Update an existing credit card.
   */
  updateCard: async (id: string, cardData: Partial<CreditCardFormData>): Promise<CreditCard> => {
    const { data } = await apiClient.patch<CreditCard>(`/credit-cards/${id}/`, cardData);
    return data;
  },

  /**
   * Delete a credit card.
   */
  deleteCard: async (id: string): Promise<void> => {
    await apiClient.delete(`/credit-cards/${id}/`);
  },
};
