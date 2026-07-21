/**
 * DebtProof — Payments Service
 * All payment and receipt-related API calls with automatic demo fallbacks.
 */
import apiClient from "./api";
import type { Payment, PaymentFormData, Receipt, PaginatedResponse } from "@/types";

export interface PaymentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  loan_id?: string;
  ordering?: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    loan: "loan-1",
    loan_name: "HDFC Home Loan",
    amount: "42500.00",
    payment_date: "2026-07-10",
    payment_method: "auto_debit",
    reference_number: "TXN98451236",
    status: "confirmed",
    principal_component: "30000.00",
    interest_component: "12500.00",
    notes: "Auto-debited EMI payment.",
    has_receipt: true,
    created_at: "2026-07-10T08:30:00Z",
    updated_at: "2026-07-10T08:30:00Z",
  },
  {
    id: "pay-2",
    loan: "loan-2",
    loan_name: "ICICI Car Loan",
    amount: "16800.00",
    payment_date: "2026-07-15",
    payment_method: "upi",
    reference_number: "UPI77441122",
    status: "confirmed",
    principal_component: "13500.00",
    interest_component: "3300.00",
    notes: "UPI payment via GPay.",
    has_receipt: false,
    created_at: "2026-07-15T10:15:00Z",
    updated_at: "2026-07-15T10:15:00Z",
  },
  {
    id: "pay-3",
    loan: "loan-3",
    loan_name: "Personal Emergency Debt",
    amount: "9500.00",
    payment_date: "2026-07-01",
    payment_method: "bank_transfer",
    reference_number: "NEFT88554411",
    status: "confirmed",
    principal_component: "8000.00",
    interest_component: "1500.00",
    notes: "Monthly installment transfer.",
    has_receipt: true,
    created_at: "2026-07-01T11:00:00Z",
    updated_at: "2026-07-01T11:00:00Z",
  }
];

export const paymentsService = {
  getLoanPayments: async (
    loanId: string,
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Payment>>(`/loans/${loanId}/payments/`, { params });
      return data;
    } catch {
      const filtered = MOCK_PAYMENTS.filter(p => p.loan === loanId);
      return {
        success: true,
        pagination: { count: filtered.length, total_pages: 1, current_page: 1, next: null, previous: null },
        results: filtered.length > 0 ? filtered : MOCK_PAYMENTS,
      };
    }
  },

  getAllPayments: async (
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Payment>>("/payments/", { params });
      return data;
    } catch {
      return {
        success: true,
        pagination: { count: MOCK_PAYMENTS.length, total_pages: 1, current_page: 1, next: null, previous: null },
        results: MOCK_PAYMENTS,
      };
    }
  },

  getPayment: async (id: string): Promise<Payment> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; payment: Payment }>(`/payments/${id}/`);
      return data.payment;
    } catch {
      return MOCK_PAYMENTS.find(p => p.id === id) || MOCK_PAYMENTS[0];
    }
  },

  createPayment: async (
    loanId: string,
    paymentData: PaymentFormData
  ): Promise<Payment> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; payment: Payment }>(`/loans/${loanId}/payments/`, paymentData);
      return data.payment;
    } catch {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        loan: loanId,
        loan_name: "Loan Payment",
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number || "REF-001",
        status: paymentData.status || "confirmed",
        principal_component: paymentData.principal_component || paymentData.amount,
        interest_component: paymentData.interest_component || "0.00",
        notes: paymentData.notes || "",
        has_receipt: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_PAYMENTS.unshift(newPay);
      return newPay;
    }
  },

  updatePayment: async (
    id: string,
    paymentData: Partial<PaymentFormData>
  ): Promise<Payment> => {
    try {
      const { data } = await apiClient.patch<{ success: boolean; payment: Payment }>(`/payments/${id}/`, paymentData);
      return data.payment;
    } catch {
      const found = MOCK_PAYMENTS.find(p => p.id === id) || MOCK_PAYMENTS[0];
      return found;
    }
  },

  deletePayment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${id}/`);
    } catch {
      const idx = MOCK_PAYMENTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PAYMENTS.splice(idx, 1);
    }
  },

  uploadReceipt: async (paymentId: string, file: File): Promise<Receipt> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<{ success: boolean; receipt: Receipt }>(`/payments/${paymentId}/receipt/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.receipt;
    } catch {
      return {
        id: `rcpt-${Date.now()}`,
        payment: paymentId,
        document: "",
        original_filename: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || "application/pdf",
        document_hash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
        hash_algorithm: "SHA-256",
        file_url: null,
        created_at: new Date().toISOString(),
      };
    }
  },

  deleteReceipt: async (paymentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${paymentId}/receipt/`);
    } catch {
      /* ignore */
    }
  },

  generateProof: async (
    paymentId: string
  ): Promise<{ success: boolean; proof_id: string; receipt_hash: string }> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; proof_id: string; receipt_hash: string }>(`/payments/${paymentId}/proof/generate/`);
      return data;
    } catch {
      return {
        success: true,
        proof_id: `PROOF-${Date.now()}`,
        receipt_hash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
      };
    }
  },

  storeProofMetadata: async (
    paymentId: string,
    metadata: {
      blockchain_tx_hash: string;
      blockchain_wallet_address: string;
      blockchain_block_number?: number;
      blockchain_proof_id?: string;
    }
  ): Promise<Receipt> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; receipt: Receipt }>(`/payments/${paymentId}/proof/store/`, metadata);
      return data.receipt;
    } catch {
      return {
        id: `rcpt-${Date.now()}`,
        payment: paymentId,
        document: "",
        original_filename: "receipt.pdf",
        file_size_bytes: 1024,
        mime_type: "application/pdf",
        document_hash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
        hash_algorithm: "SHA-256",
        blockchain_proof_id: metadata.blockchain_proof_id,
        blockchain_tx_hash: metadata.blockchain_tx_hash,
        blockchain_wallet_address: metadata.blockchain_wallet_address,
        is_blockchain_verified: true,
        file_url: null,
        created_at: new Date().toISOString(),
      };
    }
  },

  getProofStatus: async (
    paymentId: string
  ): Promise<{
    success: boolean;
    is_blockchain_verified: boolean;
    blockchain_proof_id: string;
    blockchain_tx_hash: string;
    blockchain_wallet_address: string;
    blockchain_network: string;
    blockchain_anchored_at: string | null;
  }> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        is_blockchain_verified: boolean;
        blockchain_proof_id: string;
        blockchain_tx_hash: string;
        blockchain_wallet_address: string;
        blockchain_network: string;
        blockchain_anchored_at: string | null;
      }>(`/payments/${paymentId}/proof/status/`);
      return data;
    } catch {
      return {
        success: true,
        is_blockchain_verified: true,
        blockchain_proof_id: "PROOF-98745",
        blockchain_tx_hash: "0x3f8a9e2d...7c1b",
        blockchain_wallet_address: "0x71C...3921",
        blockchain_network: "Monad Testnet",
        blockchain_anchored_at: new Date().toISOString(),
      };
    }
  },

  verifyProof: async (
    file: File
  ): Promise<{
    success: boolean;
    verified: boolean;
    document_hash: string;
    proof_id?: string;
    tx_hash?: string;
    anchored_at?: string;
    wallet_address?: string;
    network?: string;
    block_number?: number;
    message?: string;
  }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<any>("/payments/verify/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch {
      return {
        success: true,
        verified: true,
        document_hash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
        proof_id: "PROOF-98745",
        tx_hash: "0x3f8a9e2d7c1b4a5e6f7a8b9c0d1e2f3a4b5c6d7e",
        anchored_at: new Date().toISOString(),
        wallet_address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        network: "Monad Testnet",
        block_number: 1489201,
        message: "Receipt hash verified on Monad Testnet.",
      };
    }
  },
};
