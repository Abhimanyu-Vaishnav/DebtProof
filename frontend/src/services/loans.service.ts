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
}const MOCK_LOANS: Loan[] = [
  {
    id: "6a40d2f7565148f69b69efb35066473c",
    user: "b4058f3167684616aa34c6517fe9580b",
    name: "HDFC Personal Loan",
    loan_type: "personal",
    lender_name: "HDFC Bank",
    account_number: "PL-987456321",
    principal_amount: "150000.00",
    outstanding_amount: "115000.00",
    interest_rate: "11.50",
    monthly_emi: "4800.00",
    start_date: "2024-01-10",
    end_date: "2027-01-10",
    next_emi_date: "2026-08-10",
    status: "active",
    notes: "Personal loan for home expenses.",
    paid_amount: "35000.00",
    interest_paid: "12000.00",
    repayment_progress_percent: 23.3,
    is_active: true,
    is_overdue: false,
    total_payments: 18,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2026-07-10T10:00:00Z",
  },
  {
    id: "febd3d607b9443fabe358d698dd85aae",
    name: "Personal Loan By Poonawala",
    user: "b4058f3167684616aa34c6517fe9580b",
    loan_type: "personal",
    lender_name: "Poonawalla Fincorp",
    account_number: "PL-548796123",
    principal_amount: "300000.00",
    outstanding_amount: "210000.00",
    interest_rate: "12.50",
    monthly_emi: "8900.00",
    start_date: "2024-03-15",
    end_date: "2028-03-15",
    next_emi_date: "2026-08-15",
    status: "active",
    notes: "Medical emergency line.",
    paid_amount: "90000.00",
    interest_paid: "28000.00",
    repayment_progress_percent: 30.0,
    is_active: true,
    is_overdue: false,
    total_payments: 16,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2026-07-15T10:00:00Z",
  },
  {
    id: "5090673232bd48bba3845a155a420f3b",
    name: "Axis Bank Personal Loan",
    user: "b4058f3167684616aa34c6517fe9580b",
    loan_type: "personal",
    lender_name: "Axis Bank",
    account_number: "PL-112233445",
    principal_amount: "120000.00",
    outstanding_amount: "65000.00",
    interest_rate: "10.75",
    monthly_emi: "3600.00",
    start_date: "2024-05-01",
    end_date: "2027-05-01",
    next_emi_date: "2026-08-01",
    status: "active",
    notes: "Debt consolidation loan.",
    paid_amount: "55000.00",
    interest_paid: "9500.00",
    repayment_progress_percent: 45.8,
    is_active: true,
    is_overdue: false,
    total_payments: 14,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2024-05-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
  {
    id: "820e3179d50a47ef8b97475ff1009ff4",
    name: "Personal Loan From Anmol",
    user: "b4058f3167684616aa34c6517fe9580b",
    loan_type: "personal",
    lender_name: "Anmol (P2P Lender)",
    account_number: "P2P-88776655",
    principal_amount: "832000.00",
    outstanding_amount: "640000.00",
    interest_rate: "9.00",
    monthly_emi: "19200.00",
    start_date: "2023-11-20",
    end_date: "2028-11-20",
    next_emi_date: "2026-08-20",
    status: "active",
    notes: "P2P peer loan contract.",
    paid_amount: "192000.00",
    interest_paid: "45000.00",
    repayment_progress_percent: 23.0,
    is_active: true,
    is_overdue: false,
    total_payments: 22,
    is_escrow: false,
    borrower_wallet: "",
    lender_wallet: "",
    escrow_contract_address: "",
    created_at: "2023-11-20T10:00:00Z",
    updated_at: "2026-07-20T10:00:00Z",
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

const LOANS_STORAGE_KEY = "debtproof_local_loans";

function getStoredLoans(): Loan[] {
  if (typeof window === "undefined") return MOCK_LOANS;
  try {
    const raw = localStorage.getItem(LOANS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_LOANS;
}

function setStoredLoans(loans: Loan[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
  } catch {}
}

// Helper to dynamically calculate loan numbers from actual payment records
function syncLoanWithPayments(loan: Loan): Loan {
  const PAYMENTS_KEY = "debtproof_local_payments";
  let allPayments: any[] = [];
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(PAYMENTS_KEY) : null;
    if (raw) allPayments = JSON.parse(raw);
  } catch {}

  const loanPayments = allPayments.filter((p: any) => p.loan === loan.id || p.loan_id === loan.id);
  const principal = parseFloat(loan.principal_amount) || 1;

  if (loanPayments.length > 0) {
    const totalPaid = loanPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
    const outstanding = Math.max(0, principal - totalPaid);
    const progress = Math.min(100, (totalPaid / principal) * 100);

    return {
      ...loan,
      paid_amount: totalPaid.toFixed(2),
      outstanding_amount: outstanding.toFixed(2),
      total_payments: loanPayments.length,
      repayment_progress_percent: parseFloat(progress.toFixed(1)),
    };
  } else {
    // Zero payments recorded - reset values to exact 0
    return {
      ...loan,
      paid_amount: "0.00",
      interest_paid: "0.00",
      outstanding_amount: loan.principal_amount,
      total_payments: 0,
      repayment_progress_percent: 0,
    };
  }
}

export const loansService = {
  /**
   * Get all loans for the authenticated user.
   */
  getLoans: async (params?: LoanQueryParams): Promise<PaginatedResponse<Loan>> => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Loan>>("/loans/", { params });
      if (data && data.results) {
        return {
          ...data,
          results: data.results.map(syncLoanWithPayments)
        };
      }
      const localLoans = getStoredLoans().map(syncLoanWithPayments);
      return {
        success: true,
        pagination: {
          count: localLoans.length,
          total_pages: 1,
          current_page: 1,
          next: null,
          previous: null,
        },
        results: localLoans,
      };
    } catch {
      const localLoans = getStoredLoans().map(syncLoanWithPayments);
      return {
        success: true,
        pagination: {
          count: localLoans.length,
          total_pages: 1,
          current_page: 1,
          next: null,
          previous: null,
        },
        results: localLoans,
      };
    }
  },

  /**
   * Get a single loan by ID.
   */
  getLoan: async (id: string): Promise<Loan> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; loan: Loan }>(`/loans/${id}/`);
      return syncLoanWithPayments(data.loan);
    } catch {
      const localLoans = getStoredLoans();
      const found = localLoans.find((l) => l.id === id) ?? localLoans[0];
      return syncLoanWithPayments(found);
    }
  },

  /**
   * Create a new loan.
   */
  createLoan: async (loanData: LoanFormData): Promise<Loan> => {
    try {
      const { data } = await apiClient.post<{ success: boolean; loan: Loan }>("/loans/", loanData);
      // Sync to local cache as well
      if (data.loan) {
        const current = getStoredLoans();
        const existingIdx = current.findIndex(l => l.id === data.loan.id);
        if (existingIdx !== -1) current[existingIdx] = data.loan;
        else current.unshift(data.loan);
        setStoredLoans(current);
      }
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
      const current = getStoredLoans();
      current.unshift(newLoan);
      setStoredLoans(current);
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
      const current = getStoredLoans();
      const found = current.find(l => l.id === id) || current[0];
      Object.assign(found, loanData);
      setStoredLoans(current);
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
      const current = getStoredLoans();
      const idx = current.findIndex(l => l.id === id);
      if (idx !== -1) {
        current.splice(idx, 1);
        setStoredLoans(current);
      }
    }
  },

  /**
   * Get dashboard summary statistics.
   */
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const { data } = await apiClient.get<any>("/loans/dashboard/");
      if (data) {
        if (data.dashboard) return data.dashboard;
        if (typeof data.total_loans === "number") return data as DashboardData;
      }
    } catch {}

    const rawLoans = getStoredLoans();
    const loans = rawLoans.map(syncLoanWithPayments);
    const activeLoans = loans.filter(l => l.status === "active" || l.is_active);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + parseFloat(l.outstanding_amount || "0"), 0);
    const totalPrincipal = activeLoans.reduce((sum, l) => sum + parseFloat(l.principal_amount || "0"), 0);
    const totalPaid = activeLoans.reduce((sum, l) => sum + parseFloat(l.paid_amount || "0"), 0);
    const totalEmi = activeLoans.reduce((sum, l) => sum + parseFloat(l.monthly_emi || "0"), 0);

    return {
      total_loans: loans.length,
      active_loans: activeLoans.length,
      closed_loans: loans.filter(l => l.status === "closed").length,
      defaulted_loans: loans.filter(l => l.status === "defaulted").length,
      total_outstanding: totalOutstanding,
      total_principal_active: totalPrincipal,
      total_paid_active: totalPaid,
      total_interest_paid: activeLoans.reduce((sum, l) => sum + parseFloat(l.interest_paid || "0"), 0),
      total_principal_all: totalPrincipal,
      upcoming_emi_amount: totalEmi,
      upcoming_emi_date: activeLoans[0]?.next_emi_date || new Date().toISOString().split("T")[0],
      overdue_count: loans.filter(l => l.is_overdue).length,
      type_distribution: [
        { loan_type: "home", count: loans.filter(l => l.loan_type === "home").length },
        { loan_type: "vehicle", count: loans.filter(l => l.loan_type === "vehicle").length },
        { loan_type: "personal", count: loans.filter(l => l.loan_type === "personal").length },
      ],
      monthly_trend: [
        { month: "2026-02", total: totalEmi, count: activeLoans.length },
        { month: "2026-03", total: totalEmi, count: activeLoans.length },
        { month: "2026-04", total: totalEmi, count: activeLoans.length },
        { month: "2026-05", total: totalEmi, count: activeLoans.length },
        { month: "2026-06", total: totalEmi, count: activeLoans.length },
        { month: "2026-07", total: totalEmi, count: activeLoans.length },
      ],
      recent_payments: [],
      projected_debt_free_date: "2030-12",
      monthly_interest_burn: Math.round(totalOutstanding * 0.10 / 12),
      simulations: MOCK_DASHBOARD.simulations,
    };
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
