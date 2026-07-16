/**
 * DebtProof — Payments Service
 * All payment and receipt-related API calls.
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

export const paymentsService = {
  /**
   * Get all payments for a specific loan.
   */
  getLoanPayments: async (
    loanId: string,
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> => {
    const { data } = await apiClient.get<PaginatedResponse<Payment>>(
      `/loans/${loanId}/payments/`,
      { params }
    );
    return data;
  },

  /**
   * Get all payments across all loans (paginated).
   */
  getAllPayments: async (
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> => {
    const { data } = await apiClient.get<PaginatedResponse<Payment>>(
      "/payments/",
      { params }
    );
    return data;
  },

  /**
   * Get a single payment by ID.
   */
  getPayment: async (id: string): Promise<Payment> => {
    const { data } = await apiClient.get<{ success: boolean; payment: Payment }>(
      `/payments/${id}/`
    );
    return data.payment;
  },

  /**
   * Record a new payment for a loan.
   */
  createPayment: async (
    loanId: string,
    paymentData: PaymentFormData
  ): Promise<Payment> => {
    const { data } = await apiClient.post<{
      success: boolean;
      payment: Payment;
    }>(`/loans/${loanId}/payments/`, paymentData);
    return data.payment;
  },

  /**
   * Update an existing payment.
   */
  updatePayment: async (
    id: string,
    paymentData: Partial<PaymentFormData>
  ): Promise<Payment> => {
    const { data } = await apiClient.patch<{
      success: boolean;
      payment: Payment;
    }>(`/payments/${id}/`, paymentData);
    return data.payment;
  },

  /**
   * Delete a payment.
   */
  deletePayment: async (id: string): Promise<void> => {
    await apiClient.delete(`/payments/${id}/`);
  },

  /**
   * Upload a receipt for a payment.
   */
  uploadReceipt: async (paymentId: string, file: File): Promise<Receipt> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{
      success: boolean;
      receipt: Receipt;
    }>(`/payments/${paymentId}/receipt/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.receipt;
  },

  /**
   * Delete a receipt for a payment.
   */
  deleteReceipt: async (paymentId: string): Promise<void> => {
    await apiClient.delete(`/payments/${paymentId}/receipt/`);
  },

  /**
   * Generate/retrieve proof ID and hash from backend.
   */
  generateProof: async (
    paymentId: string
  ): Promise<{ success: boolean; proof_id: string; receipt_hash: string }> => {
    const { data } = await apiClient.post<{
      success: boolean;
      proof_id: string;
      receipt_hash: string;
    }>(`/payments/${paymentId}/proof/generate/`);
    return data;
  },

  /**
   * Store blockchain transaction metadata on backend.
   */
  storeProofMetadata: async (
    paymentId: string,
    metadata: {
      blockchain_tx_hash: string;
      blockchain_wallet_address: string;
      blockchain_block_number?: number;
      blockchain_proof_id?: string;
    }
  ): Promise<Receipt> => {
    const { data } = await apiClient.post<{
      success: boolean;
      receipt: Receipt;
    }>(`/payments/${paymentId}/proof/store/`, metadata);
    return data.receipt;
  },

  /**
   * Get blockchain verification/anchoring status.
   */
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
  },

  /**
   * Public verify proof by uploading file.
   */
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
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{
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
    }>("/payments/verify/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
