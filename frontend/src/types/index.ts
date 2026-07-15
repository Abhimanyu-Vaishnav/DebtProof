/**
 * DebtProof — Core TypeScript Type Definitions
 * All shared domain types used across the frontend application.
 */

// ── API Response Envelope ────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  };
  results: T[];
}

// ── User Types ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  avatar: string | null;
  avatar_url: string | null;
  bio: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: AuthTokens;
}

// ── Loan Types ───────────────────────────────────────────────
export type LoanType =
  | "home"
  | "personal"
  | "vehicle"
  | "education"
  | "business"
  | "credit_card"
  | "other";

export type LoanStatus = "active" | "closed" | "defaulted" | "on_hold";

export interface Loan {
  id: string;
  user: string;
  name: string;
  loan_type: LoanType;
  lender_name: string;
  account_number: string;
  principal_amount: string;
  outstanding_amount: string;
  interest_rate: string;
  monthly_emi: string;
  start_date: string;
  end_date: string;
  next_emi_date: string | null;
  status: LoanStatus;
  notes: string;
  paid_amount: string;
  interest_paid: string;
  repayment_progress_percent: number;
  is_active: boolean;
  is_overdue: boolean;
  total_payments: number;
  created_at: string;
  updated_at: string;
}

export interface LoanFormData {
  name: string;
  loan_type: LoanType;
  lender_name: string;
  account_number?: string;
  principal_amount: string;
  interest_rate: string;
  monthly_emi: string;
  start_date: string;
  end_date: string;
  next_emi_date?: string;
  status?: LoanStatus;
  notes?: string;
}

// ── Payment Types ────────────────────────────────────────────
export type PaymentMethod =
  | "bank_transfer"
  | "upi"
  | "neft"
  | "rtgs"
  | "cheque"
  | "auto_debit"
  | "cash"
  | "other";

export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

export interface Payment {
  id: string;
  loan: string;
  loan_name: string;
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string;
  status: PaymentStatus;
  principal_component: string;
  interest_component: string;
  notes: string;
  receipt?: Receipt;
  has_receipt: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  status?: PaymentStatus;
  principal_component?: string;
  interest_component?: string;
  notes?: string;
}

// ── Receipt Types ────────────────────────────────────────────
export interface Receipt {
  id: string;
  payment: string;
  document: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  document_hash: string;
  hash_algorithm: string;
  file_url: string | null;
  created_at: string;
}

// ── Dashboard Types ───────────────────────────────────────────
export interface LoanTypeDistribution {
  loan_type: LoanType;
  count: number;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  total: number;
  count: number;
}

export interface DashboardData {
  total_loans: number;
  active_loans: number;
  closed_loans: number;
  defaulted_loans: number;
  total_outstanding: number;
  total_principal_active: number;
  total_paid_active: number;
  total_interest_paid: number;
  total_principal_all: number;
  upcoming_emi_amount: number;
  upcoming_emi_date: string | null;
  overdue_count: number;
  type_distribution: LoanTypeDistribution[];
  monthly_trend: MonthlyTrendPoint[];
  recent_payments: Payment[];
}

// ── Utility Types ────────────────────────────────────────────
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// ── Label Maps ───────────────────────────────────────────────
export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  home: "Home Loan",
  personal: "Personal Loan",
  vehicle: "Vehicle Loan",
  education: "Education Loan",
  business: "Business Loan",
  credit_card: "Credit Card",
  other: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  neft: "NEFT",
  rtgs: "RTGS",
  cheque: "Cheque",
  auto_debit: "Auto Debit",
  cash: "Cash",
  other: "Other",
};
