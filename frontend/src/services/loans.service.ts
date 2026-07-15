/**
 * DebtProof — Loan Service
 * All loan-related API calls.
 */
import apiClient from "./api";
import type {
  Loan,
  LoanFormData,
  DashboardData,
  PaginatedResponse,
} from "@/types";

export interface LoanQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  loan_type?: string;
  ordering?: string;
  overdue?: "true" | "false";
}

export const loansService = {
  /**
   * Get all loans for the authenticated user.
   */
  getLoans: async (params?: LoanQueryParams): Promise<PaginatedResponse<Loan>> => {
    const { data } = await apiClient.get<PaginatedResponse<Loan>>("/loans/", {
      params,
    });
    return data;
  },

  /**
   * Get a single loan by ID.
   */
  getLoan: async (id: string): Promise<Loan> => {
    const { data } = await apiClient.get<{ success: boolean; loan: Loan }>(
      `/loans/${id}/`
    );
    return data.loan;
  },

  /**
   * Create a new loan.
   */
  createLoan: async (loanData: LoanFormData): Promise<Loan> => {
    const { data } = await apiClient.post<{ success: boolean; loan: Loan }>(
      "/loans/",
      loanData
    );
    return data.loan;
  },

  /**
   * Update an existing loan.
   */
  updateLoan: async (id: string, loanData: Partial<LoanFormData>): Promise<Loan> => {
    const { data } = await apiClient.patch<{ success: boolean; loan: Loan }>(
      `/loans/${id}/`,
      loanData
    );
    return data.loan;
  },

  /**
   * Delete a loan.
   */
  deleteLoan: async (id: string): Promise<void> => {
    await apiClient.delete(`/loans/${id}/`);
  },

  /**
   * Get dashboard summary statistics.
   */
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get<{
      success: boolean;
      dashboard: DashboardData;
    }>("/loans/dashboard/");
    return data.dashboard;
  },
};
