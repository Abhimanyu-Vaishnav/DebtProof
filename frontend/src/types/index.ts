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
  is_escrow: boolean;
  borrower_wallet: string;
  lender_wallet: string;
  escrow_contract_address: string;
  is_p2p_agreement?: boolean;
  counterparty_name?: string;
  counterparty_email?: string;
  counterparty_phone?: string;
  contract_status?: "draft" | "pending_signature" | "active" | "settled";
  agreement_signed_at?: string | null;
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
  is_escrow?: boolean;
  borrower_wallet?: string;
  lender_wallet?: string;
  escrow_contract_address?: string;
  is_p2p_agreement?: boolean;
  counterparty_name?: string;
  counterparty_email?: string;
  counterparty_phone?: string;
  contract_status?: string;
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
  blockchain_proof_id?: string;
  blockchain_tx_hash?: string;
  blockchain_block_number?: number;
  blockchain_network?: string;
  blockchain_anchored_at?: string;
  blockchain_wallet_address?: string;
  file_url: string | null;
  is_blockchain_verified?: boolean;
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
  projected_debt_free_date: string | null;
  monthly_interest_burn: number;
  simulations: {
    baseline: {
      debt_free_date: string | null;
      total_interest: number;
      months: number;
    };
    snowball: {
      debt_free_date: string | null;
      total_interest: number;
      interest_saved: number;
      months_saved: number;
    };
    avalanche: {
      debt_free_date: string | null;
      total_interest: number;
      interest_saved: number;
      months_saved: number;
    };
  };
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

// ── Asset & Net Worth Types ───────────────────────────────────
export type AssetClass = "current" | "fixed";

export type AssetType =
  | "cash"
  | "bank"
  | "fd"
  | "rd"
  | "investment"
  | "receivable"
  | "real_estate"
  | "gold"
  | "business"
  | "vehicle"
  | "other";

export interface Asset {
  id: string;
  name: string;
  asset_type: AssetType;
  asset_class: AssetClass;
  value: string;
  created_at: string;
  updated_at: string;
}

export type LiabilityClass = "short_term" | "long_term";

export type LiabilityType =
  | "bill"
  | "rent"
  | "tax"
  | "personal_debt"
  | "other";

export interface Liability {
  id: string;
  name: string;
  liability_type: LiabilityType;
  liability_class: LiabilityClass;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface AssetDistributionItem {
  asset_type: string;
  label: string;
  value: number;
  count: number;
}

export interface LiabilityDistributionItem {
  liability_type: string;
  label: string;
  value: number;
  count: number;
}

export interface NetWorthSummary {
  total_assets: number;
  current_assets: number;
  fixed_assets: number;
  total_liabilities: number;
  short_term_liabilities: number;
  long_term_liabilities: number;
  net_worth: number;
  asset_distribution: AssetDistributionItem[];
  liability_distribution: LiabilityDistributionItem[];
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: "Cash",
  bank: "Bank Account",
  fd: "Fixed Deposit (FD)",
  rd: "Recurring Deposit (RD)",
  investment: "Investment",
  receivable: "Receivable / Money Due",
  real_estate: "Real Estate",
  gold: "Gold",
  business: "Business Equity",
  vehicle: "Vehicle",
  other: "Other",
};

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  current: "Current Asset",
  fixed: "Fixed Asset",
};

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  bill: "Unpaid Bill",
  rent: "Rent Due",
  tax: "Tax Due",
  personal_debt: "Personal Debt",
  other: "Other Liability",
};

export const LIABILITY_CLASS_LABELS: Record<LiabilityClass, string> = {
  short_term: "Short-term",
  long_term: "Long-term",
};

// ── EMI Calendar Types ────────────────────────────────────────
export type EMIEventStatus = "upcoming" | "overdue" | "paid";

export interface EMIEvent {
  loan_id: string;
  loan_name: string;
  lender_name: string;
  loan_type: string;
  emi_amount: number;
  due_date: string; // "YYYY-MM-DD"
  status: EMIEventStatus;
}

export interface CalendarMonthSummary {
  total_emi: number;
  overdue_count: number;
  upcoming_count: number;
  paid_count: number;
}

export interface CalendarData {
  events: EMIEvent[];
  month_summary: CalendarMonthSummary;
}

// ── Notification Types ─────────────────────────────────────────
export type NotificationType =
  | "emi_upcoming"
  | "emi_overdue"
  | "payment_received"
  | "loan_closed"
  | "info";

export interface Notification {
  id: string;
  title: string;
  body: string;
  notif_type: NotificationType;
  loan: string | null;
  loan_name: string | null;
  is_read: boolean;
  created_at: string;
}

// ── Credit Card Types ─────────────────────────────────────────
export type CreditCardStatus = "active" | "frozen" | "closed";

export interface CreditCard {
  id: string;
  card_name: string;
  bank_name: string;
  credit_limit: number;
  current_outstanding: number;
  interest_rate: number;
  minimum_due: number;
  statement_date: number;
  due_date: number;
  status: CreditCardStatus;
  notes: string;
  utilization_rate: number;
  available_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CreditCardSummary {
  total_cards: number;
  total_limit: number;
  total_outstanding: number;
  available_limit: number;
  overall_utilization: number;
  avg_interest_rate: number;
}

export interface CreditCardPayment {
  id: string;
  card: string;
  card_name: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreditCardPaymentFormData {
  card: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}




