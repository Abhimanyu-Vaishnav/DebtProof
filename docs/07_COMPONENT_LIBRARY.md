# 07. Component Library

This document outlines the standard reusable UI controls used across both the React web client and Flutter mobile app.

## 1. Overview Cards
Used in the Overview dashboard. Represents summary statistics.
- **Properties**: Icon, icon container background color, title string, subtitle description, and footer status label.
- **UX Rule**: Content should scale/resize dynamically without causing layout or vertical overflow. Use child aspect ratio `1.15` in grid layouts.

## 2. Wallet Card
Displays connected blockchain credentials.
- **Properties**: Wallet status badge ("Connected" vs "Disconnected"), Monad wallet public key string with copy-to-clipboard actions, current balance in MON, and active network label ("Monad Testnet").
- **Design**: Primary Navy background (`#17375E`), monospace typography for address presentation, and green circular pulse indicating link status.

## 3. Loan Card
Summarizes loan instances in lists.
- **Properties**: Loan name, lender title, status badge (e.g. "ACTIVE", "CLOSED"), principal amount, remaining outstanding balance, interest rate, and a horizontal progress bar.
- **Progress Calculation**: `totalPaid / principalAmount` mapped to a linear indicator.

## 4. Payment Card
Summarizes payments.
- **Properties**: Loan parent name, date format (`yMMMMd`), payment reference number, paid amount (bold, green/black), and status pill (`CONFIRMED`, `PENDING`, `FAILED`).

## 5. Skeleton Loaders
Displays mock animations during API calls.
- **Implementation**: Shimmer container with linear gradients going from `#E5EAF2` to `#F5F7FB`.
