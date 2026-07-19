# 02. API Documentation

This document contains full endpoint specifications, expected payload payloads, header structures, and response JSON formats for all API endpoints in the DebtProof platform.

## Base Configuration
- **API URL Prefix**: `/api/v1`
- **Default Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Authenticated Headers**:
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 1. Authentication APIs

### Register
- **URL**: `/api/v1/auth/register/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```
- **Response Body (201 Created)**:
```json
{
  "id": "e8d98d24-3ab8-4cf5-b1a7-fb1c10faee50",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login
- **URL**: `/api/v1/auth/login/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```
- **Response Body (200 OK)**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
  "access": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

### Refresh Token
- **URL**: `/api/v1/auth/token/refresh/`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Response Body (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

### Profile Details
- **URL**: `/api/v1/auth/profile/`
- **Method**: `GET` / `PUT` / `PATCH`
- **Auth Required**: Yes
- **Response Body (200 OK)**:
```json
{
  "id": "e8d98d24-3ab8-4cf5-b1a7-fb1c10faee50",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## 2. Loan Management APIs

### List Loans
- **URL**: `/api/v1/loans/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Params**:
  - `search` (String, optional)
  - `status` (String, optional: `active`, `closed`)
- **Response Body (200 OK)**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "4a71d8bc-7fd2-4028-a4de-129ea5b82877",
      "loan_name": "Home Loan",
      "lender_name": "HDFC Bank",
      "principal_amount": "500000.00",
      "interest_rate": "8.50",
      "tenure_months": 120,
      "start_date": "2026-01-15",
      "loan_type": "home",
      "status": "active",
      "outstanding_balance": "500000.00",
      "created_at": "2026-07-17T09:00:00Z"
    }
  ]
}
```

### Create Loan
- **URL**: `/api/v1/loans/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "loan_name": "Home Loan",
  "lender_name": "HDFC Bank",
  "principal_amount": "500000.00",
  "interest_rate": "8.50",
  "tenure_months": 120,
  "start_date": "2026-01-15",
  "loan_type": "home"
}
```
- **Response Body (201 Created)**: Returns the newly created Loan object.

### Get Dashboard Summary (V2)
- **URL**: `/api/v1/loans/dashboard/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response Body (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "total_loans": 3,
    "active_loans": 2,
    "closed_loans": 1,
    "defaulted_loans": 0,
    "total_outstanding": 450000.00,
    "total_principal_active": 500000.00,
    "total_paid_active": 50000.00,
    "total_interest_paid": 4500.00,
    "total_principal_all": 600000.00,
    "upcoming_emi_amount": 12000.00,
    "upcoming_emi_date": "2026-08-01",
    "overdue_count": 0,
    "type_distribution": [
      {
        "loan_type": "home",
        "count": 1
      }
    ],
    "monthly_trend": [
      {
        "month": "2026-07",
        "total": 12000.00,
        "count": 1
      }
    ],
    "recent_payments": [],
    "projected_debt_free_date": "2032-05",
    "monthly_interest_burn": 3125.00,
    "simulations": {
      "baseline": {
        "debt_free_date": "2032-05",
        "total_interest": 125000.00,
        "months": 70
      },
      "snowball": {
        "debt_free_date": "2029-11",
        "total_interest": 75000.00,
        "interest_saved": 50000.00,
        "months_saved": 30
      },
      "avalanche": {
        "debt_free_date": "2029-08",
        "total_interest": 70000.00,
        "interest_saved": 55000.00,
        "months_saved": 33
      }
    }
  }
}
```

---

## 3. Payments & Receipts APIs

### Record Payment
- **URL**: `/api/v1/loans/<uuid:loan_id>/payments/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "amount": "10000.00",
  "payment_date": "2026-07-17",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456789",
  "notes": "July EMI repayment"
}
```
- **Response Body (201 Created)**:
```json
{
  "id": "18b958fb-7df2-43bb-a5cc-f39ea1cb1999",
  "loan": "4a71d8bc-7fd2-4028-a4de-129ea5b82877",
  "amount": "10000.00",
  "payment_date": "2026-07-17",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456789",
  "status": "confirmed"
}
```

### Upload Receipt File
- **URL**: `/api/v1/payments/<uuid:payment_id>/receipt/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Multipart file binary.
- **Response Body (201 Created)**:
```json
{
  "success": true,
  "receipt": {
    "id": "78aa89b9-d2b3-4f92-aa8f-9a11a8b982ef",
    "original_filename": "receipt_july.pdf",
    "file_url": "/media/receipts/receipt_july.pdf",
    "file_size_bytes": 102400,
    "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "is_blockchain_verified": false
  }
}
```
