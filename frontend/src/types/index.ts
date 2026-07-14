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
  repayment_progress_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  amount: string;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string;
  status: PaymentStatus;
  principal_component: string;
  interest_component: string;
  notes: string;
  receipt?: Receipt;
  created_at: string;
  updated_at: string;
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
  // Blockchain fields — available in future sprints
  // blockchain_tx_hash?: string;
  // blockchain_block_number?: number;
  // is_blockchain_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Dashboard Summary Types ───────────────────────────────────
export interface DashboardSummary {
  total_loans: number;
  active_loans: number;
  closed_loans: number;
  total_outstanding: number;
  total_principal: number;
  upcoming_emi_amount: number;
  upcoming_emi_date: string | null;
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
