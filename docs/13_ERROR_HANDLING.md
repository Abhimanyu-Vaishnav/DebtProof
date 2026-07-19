# 13. Error Handling & Offline Sync

This document defines standard API error responses, client-side notification behaviors, and offline synchronisation models.

## HTTP Status Codes Reference

| HTTP Status | Client Parsing Logic | Action | User Notification |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | Validate field dictionaries | Render error flags next to inputs | "Please verify details entered." |
| **401 Unauthorized** | Expired access token | Trigger token rotation / Login redirect | "Session expired. Re-authenticating..." |
| **403 Forbidden** | Access control block | Deny page navigation / Go back | "Action prohibited." |
| **404 Not Found** | Missing resource lookup | Render empty state panel | "Requested item not found." |
| **429 Too Many Requests** | Rate limit block | Set request cooldown | "Too many requests. Please wait." |
| **500 Internal Error** | System crash | Block inputs / Show maintenance view | "Under maintenance. Try again later." |

---

## Offline Caching and Queue Sync

For mobile and web offline access:
1. **Network Detection**: Client uses a connectivity observer (e.g. `Connectivity` package in Flutter or `navigator.onLine` in JS).
2. **Local Caching**:
   - Web caches API states in session/local storage or Service Workers.
   - Mobile caches lists (Loans, Payments) in Local SQLite DB or Hive store.
3. **Queue Repayments**:
   - If user records a payment offline:
     - Save record locally with state flag `is_synced = false`.
     - Queue upload action.
     - On connection restoration, batch sync local payments to `/payments/` and clear local queue.
