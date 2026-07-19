# 08. Screen Documentation

This document describes all primary navigation screens in the DebtProof application.

---

## 1. Login Screen
- **Purpose**: Authenticate users using email and password credentials.
- **Widgets**:
  - Email text input (with validation: email regex, cannot be empty).
  - Password text input (with validation: length >= 8, cannot be empty).
  - "Sign In" button (triggers login API).
  - "Register" hyperlink (routes to Register screen).
- **Navigation Actions**: On 200 OK login response, routes user to `/dashboard`.

## 2. Register Screen
- **Purpose**: Sign up new user accounts.
- **Widgets**:
  - First Name & Last Name inputs.
  - Email input.
  - Password input.
  - Confirm Password input.
  - "Register" button.
- **Navigation Actions**: Redirects user to `/login` on successful registration.

## 3. Dashboard (Overview) Screen
- **Purpose**: Displays outstanding liability aggregate counters, calendar schedules, quick actions, blockchain link badges, and payment chart progress.
- **Widgets**:
  - GridView of 4 Stats Cards (Total Loans, Total Outstanding, Upcoming EMI, Closed Loans count).
  - Quick Actions Row (Add Loan, My Loans, Analytics, Payments).
  - Wallet Status card (showing connected address, network, explorer, MON balance).
  - Payments Chart (Bar chart representing previous months' paid volumes vs pending).

## 4. Loans List Screen
- **Purpose**: View all loans associated with the user account.
- **Widgets**:
  - Search field (calls `/loans/?search=<query>`).
  - Status filter popup (choices: All, Active, Closed).
  - ListView of Loan Cards.
  - Floating Action Button ("+") (routes to Add Loan Screen).

## 5. Loan Details Screen
- **Purpose**: Dive into outstanding balance specifics, interest ratios, payment history, and direct payment action hooks.
- **Widgets**:
  - Outstanding balance summary card.
  - Loan terms detail grid (principal, interest p.a., tenure, type).
  - Payment History timeline (ListView of confirmed installments).
  - "MAKE A PAYMENT" floating bottom action button (routes to Record Payment Screen).

## 6. Payment Details Screen
- **Purpose**: Audit reference numbers, payment channel details, uploaded receipt documents, and cryptographic verification on Monad.
- **Widgets**:
  - Payment transaction status box.
  - Details panel (reference number, payment channel, payment date, notes).
  - Blockchain proof validation box (transaction hash, network, Explorer link).
  - Receipt preview container (routes to Receipt Details Screen, or prompts upload if null).
