# 09. Business Logic

This document specifies the calculations, rules, and procedures governing the DebtProof platform.

## 1. Loan Statistics calculations
- **Paid Amount**:
  - `paid_amount = principal_amount - outstanding_amount`
- **Repayment Progress**:
  - `repayment_progress_percent = (paid_amount / principal_amount) * 100` (defaults to `0.0` if `principal_amount == 0`).
- **Outstanding Amount Reduction**:
  - Whenever a new payment is recorded, the loan's `outstanding_amount` is reduced by the payment amount:
    `new_outstanding = outstanding_amount - payment_amount`.
  - A validation rule prevents the payment amount from exceeding the loan's current `outstanding_amount`.
  - Once the `outstanding_amount` reaches exactly `0.00`, the loan's status is automatically updated to `closed`.

---

## 2. Blockchain Proof anchoring flow
1. **Hash Generation**:
   - The frontend generates a SHA-256 hash of the receipt file.
   - Standard Web3 libraries (or `web3dart` in Flutter) calculate this hash locally:
     `receiptHash = sha256(fileBytes)`.
2. **Proof ID Request**:
   - The client posts the payment ID to `/api/v1/payments/<uuid:payment_id>/proof/generate/`.
   - The server registers the `document_hash` on the `Receipt` object and yields a UUID representing the `proof_id`.
3. **Smart Contract anchoring**:
   - The client signs a transaction targeting the Monad contract address, calling `storeProof(proofId, receiptHash)`.
   - On successful transaction confirmation, the transaction hash is posted to `/api/v1/payments/<uuid:payment_id>/proof/store/` to complete verification.
