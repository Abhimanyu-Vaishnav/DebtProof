/**
 * DebtProof — Loan Service
 * All loan-related API calls with automatic offline/demo fallback.
 */
import apiClient from "./api";
import type {
  Loan,
  LoanFormData,
  DashboardData,
  CalendarData,
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

const MOCK_LOANS: Loan[] = [
  {
    id: "loan-1",
    user: "usr-1",
    name: "HDFC Home Loan",
    loan_type: "home",
    lender_name: "HDFC Bank",
    account_number: "HL-987456321",
    principal_amount: "4500000.00",
    outstanding_amount: "3850000.00",
    interest_rate: "8.50",
    monthly_emi: "42500.00",
    start_date: "2022-04-10",
    end_date: "2042-04-10",
    next_emi_date: "2026-08-10",
    status: "active",
    notes: "20 year home loan for 3BHK Apartment.",
    paid_amount: "650000.00",
    interest_paid: "320000.00",
    repayment_progress_percent: 14.4,
    is_active: true,
    is_overdue: false,
    total_payments: 48,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2022-04-10T10:00:00Z",
    updated_at: "2026-07-10T10:00:00Z",
  },
  {
    id: "loan-2",
    name: "ICICI Car Loan",
    user: "usr-1",
    loan_type: "vehicle",
    lender_name: "ICICI Bank",
    account_number: "VL-548796123",
    principal_amount: "800000.00",
    outstanding_amount: "320000.00",
    interest_rate: "9.25",
    monthly_emi: "16800.00",
    start_date: "2024-01-15",
    end_date: "2029-01-15",
    next_emi_date: "2026-08-15",
    status: "active",
    notes: "5 year auto loan for SUV.",
    paid_amount: "480000.00",
    interest_paid: "95000.00",
    repayment_progress_percent: 60.0,
    is_active: true,
    is_overdue: false,
    total_payments: 30,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2026-07-15T10:00:00Z",
  },
  {
    id: "loan-3",
    name: "Personal Emergency Debt",
    user: "usr-1",
    loan_type: "personal",
    lender_name: "Axis Bank",
    account_number: "PL-112233445",
    principal_amount: "200000.00",
    outstanding_amount: "75000.00",
    interest_rate: "12.00",
    monthly_emi: "9500.00",
    start_date: "2025-02-01",
    end_date: "2027-02-01",
    next_emi_date: "2026-08-01",
    status: "active",
    notes: "Personal loan for home renovation.",
    paid_amount: "125000.00",
    interest_paid: "22000.00",
    repayment_progress_percent: 62.5,
    is_active: true,
    is_overdue: false,
    total_payments: 17,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2025-02-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  }
];

const MOCK_DASHBOARD: DashboardData = {
  total_loans: 3,
  active_loans: 3,
  closed_loans: 0,
  defaulted_loans: 0,
  total_outstanding: 4245000,
  total_principal_active: 5500000,
  total_paid_active: 1255000,
  total_interest_paid: 437000,
  total_principal_all: 5500000,
  upcoming_emi_amount: 68800,
  upcoming_emi_date: "2026-08-01",
  overdue_count: 0,
  type_distribution: [
    { loan_type: "home", count: 1 },
    { loan_type: "vehicle", count: 1 },
    { loan_type: "personal", count: 1 },
  ],
  monthly_trend: [
    { month: "2026-02", total: 68800, count: 3 },
    { month: "2026-03", total: 68800, count: 3 },
    { month: "2026-04", total: 68800, count: 3 },
    { month: "2026-05", total: 68800, count: 3 },
    { month: "2026-06", total: 68800, count: 3 },
    { month: "2026-07", total: 68800, count: 3 },
  ],
  recent_payments: [
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
    }
  ],
  projected_debt_free_date: "2042-04",
  monthly_interest_burn: 31200,
  simulations: {
    baseline: {
      debt_free_date: "2042-04-10",
      total_interest: 2850000,
      months: 189,
    },
    snowball: {
      debt_free_date: "2039-11-10",
      total_interest: 2150000,
      interest_saved: 700000,
      months_saved: 29,
    },
    avalanche: {
      debt_free_date: "2039-05-10",
      total_interest: 1980000,
      interest_saved: 870000,
      months_saved: 35,
    },
  },
};

export const loansService = {
  /**
   * Get all loans for the authenticated user.
   */
  getLoans: async (params?: LoanQueryParams): Promise<PaginatedResponse<Loan>> => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Loan>>("/loans/", { params });
      if (data && data.results && data.results.length > 0) {
        return data;
      }
      return data;
    } catch {
      return {
        success: true,
        pagination: {
          count: MOCK_LOANS.length,
          total_pages: 1,
          current_page: 1,
          next: null,
          previous: null,
        },
        results: MOCK_LOANS,
      };
    }
  },

  /**
   * Get a single loan by ID.
   */
  getLoan: async (id: string): Promise<Loan> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; loan: Loan }>(`/loans/${id}/`);
      return data.loan;
    } catch {
      const found = MOCK_LOANS.find(l => l.id === id) || MOCK_LOANS[0];
      return found;
    }
  },

  /**
   * Create a new loan.
   */
  createLoan: async (loanData: LoanFormData): Promise<Loan> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; loan: Loan }>("/loans/", loanData);
      return data.loan;
    } catch {
      const newLoan: Loan = {
        id: `loan-${Date.now()}`,
        user: "usr-1",
        name: loanData.name,
        loan_type: loanData.loan_type,
        lender_name: loanData.lender_name,
        account_number: loanData.account_number || "ACC-12345",
        principal_amount: loanData.principal_amount,
        outstanding_amount: loanData.principal_amount,
        interest_rate: loanData.interest_rate,
        monthly_emi: loanData.monthly_emi,
        start_date: loanData.start_date,
        end_date: loanData.end_date,
        next_emi_date: loanData.next_emi_date || loanData.start_date,
        status: loanData.status || "active",
        notes: loanData.notes || "",
        paid_amount: "0.00",
        interest_paid: "0.00",
        repayment_progress_percent: 0,
        is_active: true,
        is_overdue: false,
        total_payments: 0,
        is_escrow: !!loanData.is_escrow,
        borrower_wallet: loanData.borrower_wallet || "",
        lender_wallet: loanData.lender_wallet || "",
        escrow_contract_address: loanData.escrow_contract_address || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_LOANS.unshift(newLoan);
      return newLoan;
    }
  },

  /**
   * Update an existing loan.
   */
  updateLoan: async (id: string, loanData: Partial<LoanFormData>): Promise<Loan> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; loan: Loan }>(`/loans/${id}/`, loanData);
      return data.loan;
    } catch {
      const found = MOCK_LOANS.find(l => l.id === id) || MOCK_LOANS[0];
      Object.assign(found, loanData);
      return found;
    }
  },

  /**
   * Delete a loan.
   */
  deleteLoan: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/loans/${id}/`);
    } catch {
      const idx = MOCK_LOANS.findIndex(l => l.id === id);
      if (idx !== -1) MOCK_LOANS.splice(idx, 1);
    }
  },

  /**
   * Get dashboard summary statistics.
   */
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        dashboard: DashboardData;
      }>("/loans/dashboard/");
      return data.dashboard;
    } catch {
      return MOCK_DASHBOARD;
    }
  },

  /**
   * Get EMI calendar events for a given year/month.
   */
  getCalendar: async (year: number, month: number): Promise<CalendarData> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        year: number;
        month: number;
        calendar: CalendarData;
      }>("/loans/calendar/", { params: { year, month } });
      return data.calendar;
    } catch {
      const monthStr = String(month).padStart(2, "0");
      return {
        month_summary: {
          total_emi: 68800,
          upcoming_count: 3,
          paid_count: 3,
          overdue_count: 0,
        },
        events: [
          { due_date: `${year}-${monthStr}-01`, loan_id: "loan-3", loan_name: "Personal Emergency Debt", lender_name: "Axis Bank", loan_type: "personal", emi_amount: 9500, status: "paid" },
          { due_date: `${year}-${monthStr}-10`, loan_id: "loan-1", loan_name: "HDFC Home Loan", lender_name: "HDFC Bank", loan_type: "home", emi_amount: 42500, status: "paid" },
          { due_date: `${year}-${monthStr}-15`, loan_id: "loan-2", loan_name: "ICICI Car Loan", lender_name: "ICICI Bank", loan_type: "vehicle", emi_amount: 16800, status: "paid" }
        ]
      };
    }
  },

  /**
   * Simulate payoff projections with customized extra monthly payment.
   */
  simulatePayoff: async (extraMonthly: number): Promise<any> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        extra_monthly: number;
        simulations: any;
      }>("/loans/simulate/", { params: { extra_monthly: extraMonthly } });
      return data;
    } catch {
      return {
        success: true,
        extra_monthly: extraMonthly,
        simulations: MOCK_DASHBOARD.simulations
      };
    }
  },
};
