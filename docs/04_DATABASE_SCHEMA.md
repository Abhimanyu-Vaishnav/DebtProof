# 04. Database Schema

This document outlines the detailed database tables, columns, data types, indexes, and primary/foreign key configurations of the DebtProof platform.

## Base Model Class (Audit Fields)
All models extend a `BaseModel` which inherits from `UUIDModel` and adds:
- `id` (`UUID`, primary key, defaults to `uuid.uuid4`)
- `created_at` (`DateTimeField`, auto_now_add=True)
- `updated_at` (`DateTimeField`, auto_now=True)

---

## 1. User Model (`users` table)
Inherits from Django's standard `AbstractUser`.
- `id` (`UUID`, Primary Key)
- `email` (`CharField`, unique=True)
- `first_name` (`CharField`)
- `last_name` (`CharField`)
- `phone_number` (`CharField`, nullable)
- `is_email_verified` (`BooleanField`, default=False)
- `wallet_address` (`CharField`, length=42, unique=True, nullable)
- `created_at` (`DateTimeField`)
- `updated_at` (`DateTimeField`)

---

## 2. Loan Model (`loans` table)
- `id` (`UUID`, Primary Key)
- `user_id` (`UUID`, Foreign Key referencing `users(id)`, ON DELETE CASCADE)
- `name` (`CharField(200)`)
- `loan_type` (`CharField(20)`, choices: `home`, `personal`, `vehicle`, `education`, `business`, `credit_card`, `other`)
- `lender_name` (`CharField(200)`)
- `account_number` (`CharField(100)`)
- `principal_amount` (`Decimal(14,2)`)
- `outstanding_amount` (`Decimal(14,2)`)
- `interest_rate` (`Decimal(5,2)`)
- `monthly_emi` (`Decimal(12,2)`)
- `start_date` (`Date`)
- `end_date` (`Date`)
- `next_emi_date` (`Date`, nullable)
- `status` (`CharField(20)`, choices: `active`, `closed`, `defaulted`, `on_hold`)

---

## 3. Payment Model (`payments` table)
- `id` (`UUID`, Primary Key)
- `loan_id` (`UUID`, Foreign Key referencing `loans(id)`, ON DELETE PROTECT)
- `amount` (`Decimal(12,2)`)
- `payment_date` (`Date`)
- `payment_method` (`CharField(20)`, choices: `bank_transfer`, `upi`, `neft`, `rtgs`, `cheque`, `auto_debit`, `cash`, `other`)
- `reference_number` (`CharField(200)`)
- `status` (`CharField(20)`, choices: `pending`, `confirmed`, `failed`, `refunded`)
- `principal_component` (`Decimal(12,2)`)
- `interest_component` (`Decimal(12,2)`)
- `notes` (`TextField`)

---

## 4. Receipt Model (`receipts` table)
- `id` (`UUID`, Primary Key)
- `payment_id` (`UUID`, OneToOneField referencing `payments(id)`, ON DELETE CASCADE)
- `document` (`FileField` / path to media upload)
- `original_filename` (`CharField(255)`)
- `file_size_bytes` (`PositiveIntegerField`)
- `mime_type` (`CharField(100)`)
- `document_hash` (`CharField(64)`, unique=True, index=True)
- `hash_algorithm` (`CharField(20)`, default=`sha256`)
- `blockchain_proof_id` (`CharField(36)`)
- `blockchain_tx_hash` (`CharField(66)`)
- `blockchain_block_number` (`PositiveBigIntegerField`, nullable)
- `blockchain_network` (`CharField(50)`, default=`monad-testnet`)
- `blockchain_anchored_at` (`DateTimeField`, nullable)
- `blockchain_wallet_address` (`CharField(42)`)
- `is_blockchain_verified` (`BooleanField`, default=False)
