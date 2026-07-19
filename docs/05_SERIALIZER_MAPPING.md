# 05. Serializer Mapping

This document specifies the exact property name translations from Database columns to Serializer fields, and their corresponding Flutter property representations.

## 1. User/Profile Serializer Mapping

| Django Database Field | Serializer Key (API JSON Field) | API Type | Flutter Model Property |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `String` (UUID) | `final String id;` |
| `email` | `email` | `String` (Email) | `final String email;` |
| `first_name` | `first_name` | `String` | `final String firstName;` |
| `last_name` | `last_name` | `String` | `final String lastName;` |
| `wallet_address` | `wallet_address` | `String?` | `final String? walletAddress;` |

---

## 2. Loan Serializer Mapping

| Django Database Field | Serializer Key (API JSON Field) | API Type | Flutter Model Property |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `String` (UUID) | `final String id;` |
| `name` | `loan_name` | `String` | `final String loanName;` |
| `lender_name` | `lender_name` | `String` | `final String lenderName;` |
| `principal_amount` | `principal_amount` | `String` (Decimal) | `final double principalAmount;` |
| `outstanding_amount` | `outstanding_amount` | `String` (Decimal) | `final double outstandingBalance;` |
| `interest_rate` | `interest_rate` | `String` (Decimal) | `final double interestRate;` |
| `tenure_months` | `tenure_months` | `Integer` | `final int tenureMonths;` |
| `start_date` | `start_date` | `String` (YYYY-MM-DD) | `final DateTime startDate;` |
| `loan_type` | `loan_type` | `String` | `final String loanType;` |
| `status` | `status` | `String` | `final String status;` |

---

## 3. Payment Serializer Mapping

| Django Database Field | Serializer Key (API JSON Field) | API Type | Flutter Model Property |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `String` (UUID) | `final String id;` |
| `loan_id` | `loan` | `String` (UUID) | `final String loanId;` |
| `amount` | `amount` | `String` (Decimal) | `final double amount;` |
| `payment_date` | `payment_date` | `String` (YYYY-MM-DD) | `final DateTime paymentDate;` |
| `payment_method` | `payment_method` | `String` | `final String paymentMethod;` |
| `reference_number` | `reference_number` | `String` | `final String referenceNumber;` |
| `status` | `status` | `String` | `final String status;` |
| `notes` | `notes` | `String?` | `final String? notes;` |
| `loan.name` (related) | `loan_name` | `String` | `final String? loanName;` |
| `receipt` (nested) | `receipt` | `ReceiptSerializer?` | `final ReceiptModel? receipt;` |

---

## 4. Receipt Serializer Mapping

| Django Database Field | Serializer Key (API JSON Field) | API Type | Flutter Model Property |
| :--- | :--- | :--- | :--- |
| `id` | `id` | `String` (UUID) | `final String id;` |
| `original_filename` | `original_filename` | `String` | `final String originalFilename;` |
| `file_size_bytes` | `file_size_bytes` | `Integer` | `final int fileSizeEncoding;` |
| `mime_type` | `mime_type` | `String` | `final String mimeType;` |
| `document_hash` | `document_hash` | `String` | `final String documentHash;` |
| `hash_algorithm` | `hash_algorithm` | `String` | `final String hashAlgorithm;` |
| `document.url` | `file_url` | `String` | `final String? fileUrl;` |
| `blockchain_proof_id` | `blockchain_proof_id` | `String?` (UUID) | `final String? blockchainProofId;` |
| `blockchain_tx_hash` | `blockchain_tx_hash` | `String?` | `final String? blockchainTxHash;` |
| `blockchain_wallet_address` | `blockchain_wallet_address` | `String?` | `final String? blockchainWalletAddress;` |
| `is_blockchain_verified` | `is_blockchain_verified` | `Boolean` | `final bool isBlockchainVerified;` |
