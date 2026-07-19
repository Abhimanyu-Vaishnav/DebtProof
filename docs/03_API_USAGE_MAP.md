# 03. API Usage Map

This document maps all UI screens in the client application to their corresponding REST backend endpoints.

| Screen | API Called | HTTP Method | Response Serializer / Model | UI Widget / Target | User Trigger Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login** | `/api/v1/auth/login/` | `POST` | `TokenObtainPairSerializer` | Form Container | Click 'Sign In' |
| **Register** | `/api/v1/auth/register/` | `POST` | `UserRegisterSerializer` | Form Container | Click 'Create Account' |
| **Dashboard** | `/api/v1/loans/dashboard/` | `GET` | `DashboardStatsModel` | Stats Cards, Quick Actions, Chart | Initial Load / Pull-to-refresh |
| **My Loans** | `/api/v1/loans/` | `GET` | `LoanModelList` | ListView / Loan Cards | Initial Load / Search bar / Tab filters |
| **Add Loan** | `/api/v1/loans/` | `POST` | `LoanModel` | Form Container | Click 'Create Loan' |
| **Loan Details** | `/api/v1/loans/<uuid:id>/` | `GET` | `LoanModel` | Header Info Card, Breakdown Section | Initial Load |
| **Loan Details** | `/api/v1/payments/?loan=<id>` | `GET` | `PaymentModelList` | Payment History ListView | Initial Load |
| **Record Payment** | `/api/v1/loans/<id>/payments/` | `POST` | `PaymentModel` | Form Container | Click 'Record Payment' |
| **Payment Details** | `/api/v1/payments/<id>/` | `GET` | `PaymentModel` | Details Cards, Status Badges | Initial Load |
| **Upload Receipt** | `/api/v1/payments/<id>/receipt/` | `POST` | `ReceiptSerializer` | File Picker Card | File submission |
| **Blockchain Proof** | `/api/v1/payments/<id>/proof/generate/` | `POST` | Proof Parameters Hash | Proof Action Card | Click 'Verify On-chain' / 'Anchored Proof' |
| **Blockchain Proof** | `/api/v1/payments/<id>/proof/store/` | `POST` | `ReceiptSerializer` | Transaction Confirmation | Tx signature complete |
| **Verify Public** | `/api/v1/payments/verify/` | `GET` | Verification Result | Verification Status Panel | Enter Hash / Scan QR code |
| **My Account** | `/api/v1/auth/profile/` | `GET` | `UserSerializer` | Avatar, Form Inputs | Initial Load |
