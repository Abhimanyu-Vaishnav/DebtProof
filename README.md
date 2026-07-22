# 📑 DebtProof — Modern Decentralized Financial & Debt Management Platform 🚀

> **Never lose proof of your loan repayments again.** Manage traditional bank debts, track investments, optimize monthly budgets, participate in P2P Web3 lending, and generate immutable cryptographic proof of every transaction on the **Monad Blockchain**.

🌐 **Live Application URL**: [https://debt-proof-front-tau.vercel.app/](https://debt-proof-front-tau.vercel.app/)

[![Live App](https://img.shields.io/badge/Live%20App-Vercel%20Deployed-10b981?style=for-the-badge&logo=vercel)](https://debt-proof-front-tau.vercel.app/)
[![Organization](https://img.shields.io/badge/Organization-Sanatan%20Labs-1a3a5c?style=for-the-badge)](https://github.com/sanatan-labs)
[![Blockchain](https://img.shields.io/badge/Blockchain-Monad%20Testnet-7c3aed?style=for-the-badge)](https://monad.xyz)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🌟 What is DebtProof?

**DebtProof** is an end-to-end, human-first personal financial management ecosystem. Whether you are managing multiple bank loans (Home, Vehicle, Personal, Credit Cards), tracking your investment SIPs, planning monthly household budgets, or participating in peer-to-peer (P2P) lending — DebtProof brings clarity, automation, and cryptographic trust to your financial life.

Every payment receipt uploaded is hashed using **SHA-256** and anchored onto the **Monad Blockchain**, guaranteeing that your repayment records can **never be deleted, backdated, or disputed by lenders**.

---

## 🚀 Key Features & Detailed Module Guide

Here is a comprehensive breakdown of everything built into DebtProof, how each module works, and why it matters:

### 1. 📊 Interactive Dashboard & Financial Command Center
- **What it does**: Provides a bird's-eye view of your entire financial standing — total borrowed principal, total repaid principal, active outstanding debt, and monthly interest burn.
- **Key Capabilities**:
  - **Individual Loan Progress Cards**: Visual status bars with % repaid, color-coded overdue warnings, and click-to-navigate access.
  - **Monthly Payment History Chart**: Interactive bar/line chart showing monthly payment trends.
  - **Live Income Tracker**: Synchronized multi-source income tracker (Salary, Rental, Freelance, Business) that alerts you if your monthly EMI exceeds safe limits (DTI > 35%).
  - **Dashboard Customization**: Hide or show widgets based on personal preference via Settings.

### 2. 🏦 My Loans & Repayment Management
- **What it does**: Track home loans, car loans, education loans, personal loans, and business liabilities in one place.
- **Key Capabilities**:
  - **Loan Detail Page**: Displays a 140px radial repayment progress ring, key numbers (Principal Paid, Outstanding Balance, Interest Cost), and monthly payment history bars.
  - **⚡ Foreclosure & Part-Pay Calculator**: Calculate exact interest saved and tenure reduced by making lump-sum prepayments.
  - **Payment Logger**: Record monthly EMIs with principal vs interest split, payment method (UPI, Auto-debit, NEFT), and transaction reference numbers.

### 3. 💵 Intelligent Budget Planner (`/dashboard/budget`)
- **What it does**: A unified cash flow engine that balances monthly income streams, living expenses, EMI commitments, and savings targets.
- **Key Capabilities**:
  - **🔄 2-Way Real-time Income Sync**: Changes made in the Budget Planner immediately reflect on the main Dashboard and vice versa.
  - **Budget Health Score (0–100)**: Animated health gauge rating your cash flow (Excellent, Good, Fair, Tight, Critical).
  - **Visual Cash Flow Allocation Bar**: Color-coded breakdown showing exact percentages for EMIs, Living Expenses, Savings Target, and Free Surplus.
  - **Custom Expenses Tracking**: Track 8 living categories (Rent, Food, Utilities, Transport, Health, Entertainment, Education, Misc).
  - **Smart Tips**: Automated warnings when your DTI ratio exceeds 40% or savings rate falls below 20%.

### 4. 📈 Investments & Wealth Tracker (`/dashboard/investments`)
- **What it does**: Track wealth-building assets including Mutual Fund SIPs, Stocks, Fixed Deposits, Real Estate, Gold, and Crypto.
- **Key Capabilities**:
  - **Investment Detail Growth Chart**: Interactive SVG curve displaying **Invested Capital vs Current Valuation** over time.
  - **🚀 Future Compound Wealth Predictor**: Calculates projected future wealth over 1, 3, 5, and 10 years at your expected CAGR %.
  - **Portfolio Mix Donut**: Visual percentage breakdown of asset categories.

### 5. 🤖 AI Debt Payoff Assistant & Strategy Coach
- **What it does**: An interactive AI chat coach floating globally on your screen that analyzes your active portfolio to provide personalized advice.
- **Key Capabilities**:
  - **Live Portfolio Context**: Auto-reads your active loans, total debt, and interest burn to give tailor-made recommendations.
  - **⚡ Extra Prepayment Impact Simulator**: Displays an interactive summary card showing exact months saved, interest saved, and new debt-free date when adding extra EMI.
  - **Strategy Coach**: Compares **Debt Avalanche** (paying highest interest first for max savings) vs **Debt Snowball** (paying smallest balance first for motivation).
  - **High-Contrast Design**: Optimized for 100% legibility in both Dark and Light themes.

### 6. 📄 Official Reports & PDF Export Engine (`/dashboard/reports`)
- **What it does**: Generate bank-grade PDF statements and CSV/JSON data dumps.
- **Key Capabilities**:
  - **📄 One-Click PDF Print**: Generates clean, formatted PDF statements (Loan Portfolio Statement, Payment History Log, Net Worth Audit) ready for printing or saving as PDF.
  - **Live Interactive Data Preview**: Filter by specific loan account, start date, or end date, and preview matching payment logs live on screen before exporting.
  - **CSV & JSON Exports**: Download raw structured data for accounting software.

### 7. 🤝 P2P Web3 Marketplace & Monad Escrow (`/dashboard/p2p-market`)
- **What it does**: Trustless peer-to-peer borrowing and lending powered by Monad Blockchain smart contracts.
- **Key Capabilities**:
  - **Zero-Middleman Escrow**: Borrowers post loan requests; lenders fund directly using **MON tokens** via MetaMask.
  - **On-chain Repayments**: Smart contracts verify and record every installment transparently without central bank intervention.

### 8. 🛡️ Cryptographic Receipt Verification (`/verify-proof`)
- **What it does**: Verify payment receipt authenticity using SHA-256 cryptographic hashes.
- **Key Capabilities**:
  - **Tamper-Proof Verification**: Upload any receipt file to compute its hash and query the Monad Testnet blockchain.
  - **Public Admissibility**: Share your hash or transaction link with banks, courts, or auditors for independent verification.

### 9. 🔔 Smart Notifications & Browser Push (`/dashboard/notifications`)
- **What it does**: Keeps you ahead of due dates with multi-channel alerts.
- **Key Capabilities**:
  - **📲 Browser Push Notifications**: Real-time push alerts on your desktop or mobile browser.
  - **Floating 3-Day EMI Reminder Popup**: Auto-appears when an EMI is due within 3 days.
  - **Swipe Gestures**: Mobile-friendly swipe right to mark read, swipe left to delete.

### 10. 📱 Progressive Web App (PWA)
- **What it does**: Install DebtProof directly onto your mobile or desktop home screen.
- **Key Capabilities**:
  - **Install Banner**: Mobile prompt to add to Home Screen.
  - **Service Worker (`sw.js`)**: Network-first strategy for navigation, offline fallback, and fast asset caching.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS (Vanilla CSS variables system), Recharts, Ethers.js v6.
- **Backend**: Django 5.0, Django REST Framework, SQLite / PostgreSQL.
- **Blockchain**: Monad Testnet (Chain ID: `10143`), Solidity Smart Contracts (EVM), SHA-256 Hashing.
- **Hosting**: Deployed on Vercel ([Live Link](https://debt-proof-front-tau.vercel.app/)).

---

## 🛡️ Monad Network Configuration

- **Network Name**: Monad Testnet
- **Chain ID**: `10143` (`0x279f`)
- **RPC URL**: `https://testnet-rpc.monad.xyz/`
- **Block Explorer**: `https://testnet.monadscan.com/`
- **Smart Contract Address**: `0x316dF00a399d655734CeaeFfEE0A7DD432e1DB5f`

---

## ⚙️ How to Run Locally

### 1. Backend Setup (Django)
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Live Web Application

Experience DebtProof live in production:
👉 **[https://debt-proof-front-tau.vercel.app/](https://debt-proof-front-tau.vercel.app/)**

---

*Built with ❤️ by [Sanatan Labs](https://github.com/sanatan-labs) for the Monad Blockchain Hackathon.*
