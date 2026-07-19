# 12. Environment Configuration

This document lists all environment variables required to run the DebtProof platform.

## 1. Backend Environment Variables (`backend/.env`)

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `SECRET_KEY` | `dev-secret-key-debtproof-app-1234567890` | Secret cryptographic key for session signatures and password hash salts. |
| `DEBUG` | `True` | Activates verbose Django debug traceback views on 500 errors. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Whitelist domains that Django can bind/serve. |
| `DB_ENGINE` | `django.db.backends.sqlite3` | Database engine driver. |
| `DB_NAME` | `db.sqlite3` | Path or name of the primary database file. |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | Lifecycle duration of short-term access token. |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` | Lifecycle duration of long-term refresh token. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Whitelisted cross-origin domains allowed to query the API. |
| `MEDIA_URL` | `/media/` | Path prefix mapping file downloads. |
| `MEDIA_ROOT` | `media/` | Directory where uploaded files/receipts are saved. |

---

## 2. Frontend Environment Variables (`frontend/.env.local` / Mobile `.env`)

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | URL endpoint of the target backend. |
| `NEXT_PUBLIC_APP_NAME` | `DebtProof` | Display name of the application. |
| `MONAD_RPC_URL` | `https://testnet-rpc.monad.xyz/` | RPC provider URL to read/write Smart Contract state. |
| `MONAD_CHAIN_ID` | `10143` | Chain ID identifying the Monad Testnet blockchain. |
| `REGISTRY_CONTRACT_ADDRESS` | `0x316dF00a399d655734CeaeFfEE0A7DD432e1DB5f` | Hex address of the deployed smart contract. |
