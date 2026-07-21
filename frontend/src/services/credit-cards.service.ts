import apiClient from "./api";
import type { CreditCard, CreditCardSummary, CreditCardPayment, CreditCardPaymentFormData } from "@/types";

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

const MOCK_CARDS: CreditCard[] = [
  {
    id: "card-1",
    card_name: "HDFC Regalia Gold",
    bank_name: "HDFC Bank",
    credit_limit: 300000.00,
    current_outstanding: 45000.00,
    interest_rate: 42.00,
    minimum_due: 2250.00,
    statement_date: 15,
    due_date: 5,
    utilization_rate: 15.0,
    available_limit: 255000.00,
    status: "active",
    notes: "Primary rewards card.",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "card-2",
    card_name: "ICICI Amazon Pay",
    bank_name: "ICICI Bank",
    credit_limit: 150000.00,
    current_outstanding: 12000.00,
    interest_rate: 40.00,
    minimum_due: 600.00,
    statement_date: 20,
    due_date: 10,
    utilization_rate: 8.0,
    available_limit: 138000.00,
    status: "active",
    notes: "Shopping card.",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  }
];

const MOCK_SUMMARY: CreditCardSummary = {
  total_cards: 2,
  total_limit: 450000,
  total_outstanding: 57000,
  available_limit: 393000,
  overall_utilization: 12.67,
  avg_interest_rate: 41.0,
};

export const creditCardsService = {
  getCards: async (): Promise<CreditCard[]> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; results: CreditCard[] }>("/credit-cards/");
      return data.results || MOCK_CARDS;
    } catch {
      return MOCK_CARDS;
    }
  },

  getSummary: async (): Promise<CreditCardSummary> => {
    try {
      const { data } = await apiClient.get<CreditCardSummary>("/credit-cards/summary/");
      return data;
    } catch {
      return MOCK_SUMMARY;
    }
  },

  createCard: async (cardData: CreditCardFormData): Promise<CreditCard> => {
    try {
      const { data } = await apiClient.post<CreditCard>("/credit-cards/", cardData);
      return data;
    } catch {
      const newCard: CreditCard = {
        id: `card-${Date.now()}`,
        card_name: cardData.card_name,
        bank_name: cardData.bank_name,
        credit_limit: cardData.credit_limit,
        current_outstanding: cardData.current_outstanding,
        interest_rate: cardData.interest_rate,
        minimum_due: cardData.minimum_due,
        statement_date: cardData.statement_date,
        due_date: cardData.due_date,
        utilization_rate: cardData.credit_limit > 0 ? (cardData.current_outstanding / cardData.credit_limit) * 100 : 0,
        available_limit: Math.max(0, cardData.credit_limit - cardData.current_outstanding),
        status: "active",
        notes: cardData.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_CARDS.unshift(newCard);
      return newCard;
    }
  },

  updateCard: async (id: string, cardData: Partial<CreditCardFormData>): Promise<CreditCard> => {
    try {
      const { data } = await apiClient.patch<CreditCard>(`/credit-cards/${id}/`, cardData);
      return data;
    } catch {
      const found = MOCK_CARDS.find(c => c.id === id) || MOCK_CARDS[0];
      return found;
    }
  },

  deleteCard: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/credit-cards/${id}/`);
    } catch {
      const idx = MOCK_CARDS.findIndex(c => c.id === id);
      if (idx !== -1) MOCK_CARDS.splice(idx, 1);
    }
  },

  getPayments: async (cardId: string): Promise<CreditCardPayment[]> => {
    try {
      const { data } = await apiClient.get<CreditCardPayment[]>(`/credit-cards/${cardId}/payments/`);
      return data || [];
    } catch {
      return [];
    }
  },

  createPayment: async (paymentData: CreditCardPaymentFormData): Promise<CreditCardPayment> => {
    try {
      const { data } = await apiClient.post<CreditCardPayment>("/credit-cards/payments/", paymentData);
      return data;
    } catch {
      return {
        id: `card-pay-${Date.now()}`,
        card: paymentData.card,
        card_name: "Credit Card",
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number || "REF123",
        notes: paymentData.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  deletePayment: async (paymentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/credit-cards/payments/${paymentId}/`);
    } catch {
      /* ignore */
    }
  },
};
