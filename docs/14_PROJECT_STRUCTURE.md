# 14. Project Structure

This document details the code directories, subfolders, and config files of the DebtProof platform.

## 1. Backend Project Structure (`backend/`)
```
backend/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── .env
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   └── development.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── apps/
    ├── core/
    │   └── models.py (BaseModel details)
    ├── users/
    │   ├── models.py
    │   └── api/
    │       ├── views.py
    │       └── serializers.py
    ├── loans/
    │   ├── models.py
    │   └── api/
    │       ├── views.py
    │       └── serializers.py
    └── payments/
        ├── models.py
        └── api/
            ├── views.py
            └── serializers.py
```

---

## 2. Web Frontend Structure (`frontend/`)
```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── app/ (App Router pages)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (dashboard)/
│   │       ├── dashboard/
│   │       │   ├── loans/
│   │       │   ├── payments/
│   │       │   ├── receipts/
│   │       │   └── verify/
│   ├── components/ (Reusable UI components)
│   ├── services/ (API/Axios integrations)
│   ├── types/ (TypeScript declarations)
│   └── utils/ (formatters, blockchain utils)
```

---

## 3. Blockchain Contract Structure (`blockchain/`)
```
blockchain/
├── package.json
├── hardhat.config.js
├── contracts/
│   └── DebtProofRegistry.sol
├── scripts/
│   └── deploy.js
└── test/
    └── DebtProofRegistry.test.js
```
