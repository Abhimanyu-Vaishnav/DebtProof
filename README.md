# DebtProof

> **Never lose proof of your loan repayments.**

[![Organization](https://img.shields.io/badge/Organization-Sanatan%20Labs-1a3a5c?style=flat-square)](https://github.com/sanatan-labs)
[![Status](https://img.shields.io/badge/Status-Day%202%20Full%20Management-10b981?style=flat-square)](#)
[![Blockchain](https://img.shields.io/badge/Blockchain-Monad%20Testnet-7c3aed?style=flat-square)](https://monad.xyz)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Project Overview

**DebtProof** is a blockchain-powered debt management application that helps users track multiple loans while creating **immutable proof of every repayment**.

Instead of storing sensitive payment documents on-chain, DebtProof stores only the **SHA-256 cryptographic hash** of repayment receipts on the **Monad Blockchain**, allowing users to verify payment authenticity without exposing personal information.

Built for the **Monad Blockchain Hackathon** by **Sanatan Labs**.

---

## Problem Statement

Borrowers frequently face disputes with lenders over repayments they've already made:

- **Lost receipts** — physical or digital receipts get deleted, misplaced, or corrupted
- **Tampered records** — screenshots and PDFs can be forged or backdated
- **No trusted authority** — no neutral, permanent record exists that both parties can trust
- **No single view** — managing multiple loans across multiple lenders is fragmented

These problems cost borrowers time, money, and stress — especially in legal disputes.

---

## Solution

DebtProof solves this with a **three-layer approach**:

1. **Management Layer** — Track all loans, EMIs, and payment history in one clean dashboard
2. **Proof Layer** — Hash every receipt document with SHA-256 before storage
3. **Blockchain Layer** — Anchor the hash on Monad Blockchain for permanent, tamper-proof verification

**Result:** Anyone with the original receipt can verify its authenticity against the blockchain hash — independently, forever.

---

## Features Implemented

### Day 1 & 2 (Current)
- [x] User authentication (JWT)
- [x] Custom user model (email-based)
- [x] Landing page with all sections
- [x] Auth pages (Login, Register, Forgot Password)
- [x] Dashboard with real aggregated stats (Total outstanding, EMIs, recent payments)
- [x] Full Loan CRUD API and UI (Add, Edit, View, Delete)
- [x] Payment recording with receipt upload
- [x] Auto-calculations of balances and EMI status via backend signals
- [x] SHA-256 receipt hashing service
- [x] Analytics dashboard with SVG charts
- [x] Profile and Settings pages
- [x] Full API response standardization
- [x] Database models for Loan, Payment, Receipt, AuditLog

### Future Roadmap
- [ ] Monad Testnet wallet integration
- [ ] Blockchain hash anchoring
- [ ] Verification portal (public hash lookup)
- [ ] EMI reminder notifications
- [ ] Report generation

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.x (App Router) | React framework + SSR |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | latest | HTTP client with JWT interceptors |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 6.x | Web framework |
| Django REST Framework | 3.17 | REST API |
| SimpleJWT | 5.x | JWT authentication |
| django-cors-headers | 4.x | CORS handling |
| django-ratelimit | 4.x | Rate limiting |
| Pillow | 12.x | Image processing |
| python-decouple | 3.x | Environment config |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary database (production) |
| SQLite | Development fallback |

### Future (Day 2+)
| Technology | Purpose |
|---|---|
| Monad Testnet | Blockchain hash anchoring |
| ethers.js | Ethereum-compatible wallet integration |
| Web3Modal | Wallet connect UI |

---

## Architecture

```
DebtProof/
├── frontend/          ← Next.js App (TypeScript + Tailwind)
│   └── src/
│       ├── app/               ← App Router pages
│       │   ├── (auth)/        ← Auth route group
│       │   ├── (dashboard)/   ← Dashboard route group
│       │   ├── layout.tsx     ← Root layout + SEO
│       │   ├── page.tsx       ← Landing page
│       │   └── not-found.tsx  ← 404 page
│       ├── components/
│       │   ├── ui/            ← Reusable base components
│       │   ├── layout/        ← Navbar, Sidebar, Topbar, Footer
│       │   └── dashboard/     ← Dashboard-specific components
│       ├── hooks/             ← useAuth, useDebounce
│       ├── services/          ← API client + auth service
│       ├── types/             ← TypeScript domain types
│       ├── utils/             ← cn(), formatters
│       └── styles/            ← Global CSS design system
│
└── backend/           ← Django + DRF (Python)
    ├── config/
    │   ├── settings/
    │   │   ├── base.py        ← Shared settings
    │   │   ├── development.py ← Dev overrides
    │   │   └── production.py  ← Production hardening
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    └── apps/
        ├── core/              ← Base models, exceptions, pagination
        ├── users/             ← Custom User model + auth APIs
        ├── loans/             ← Loan model
        └── payments/          ← Payment, Receipt, AuditLog models
```

---

## Folder Structure

```
DebtProof/
├── .gitignore
├── README.md
├── frontend/
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   └── forgot-password/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── profile/page.tsx
│       │   │   └── settings/page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx
│       │   │   └── Avatar.tsx
│       │   ├── layout/
│       │   │   ├── LandingNavbar.tsx
│       │   │   ├── LandingFooter.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Topbar.tsx
│       │   └── dashboard/
│       │       ├── OverviewCard.tsx
│       │       ├── LoanPlaceholder.tsx
│       │       ├── RecentPaymentsPlaceholder.tsx
│       │       └── QuickActions.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useDebounce.ts
│       ├── services/
│       │   ├── api.ts
│       │   └── auth.service.ts
│       ├── types/
│       │   └── index.ts
│       ├── utils/
│       │   ├── cn.ts
│       │   └── formatters.ts
│       └── styles/
│           └── globals.css
└── backend/
    ├── .env.example
    ├── manage.py
    ├── requirements.txt
    ├── config/
    │   ├── __init__.py
    │   ├── settings/
    │   │   ├── __init__.py
    │   │   ├── base.py
    │   │   ├── development.py
    │   │   └── production.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── asgi.py
    └── apps/
        ├── __init__.py
        ├── core/
        │   ├── models.py        ← BaseModel, TimeStampedModel, UUIDModel
        │   ├── exceptions.py    ← Custom exception handler
        │   ├── pagination.py    ← StandardResultsSetPagination
        │   └── api/
        │       ├── views.py     ← Health check
        │       └── urls.py
        ├── users/
        │   ├── models.py        ← Custom User model
        │   ├── admin.py
        │   └── api/
        │       ├── serializers.py
        │       ├── views.py
        │       └── urls.py
        ├── loans/
        │   └── models.py        ← Loan model
        └── payments/
            └── models.py        ← Payment, Receipt, AuditLog models
```

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL (optional — SQLite used by default in development)

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd DebtProof/backend

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your environment file
cp .env.example .env
# Edit .env with your database credentials and secret key

# 5. Run migrations
python manage.py migrate

# 6. Create a superuser (optional)
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver
```

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd DebtProof/frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `DB_ENGINE` | Database engine | SQLite |
| `DB_NAME` | Database name | `db.sqlite3` |
| `DB_USER` | Database user | `""` |
| `DB_PASSWORD` | Database password | `""` |
| `DB_HOST` | Database host | `""` |
| `DB_PORT` | Database port | `""` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | JWT access token lifetime | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | JWT refresh token lifetime | `7` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | App name | `DebtProof` |

---

## How to Run

### Development (Both Servers)

**Terminal 1 — Backend:**
```bash
cd backend
python manage.py runserver
# API available at http://localhost:8000
# Admin panel at http://localhost:8000/admin
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App available at http://localhost:3000
```

### API Endpoints (Day 1)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/health/` | Service health check | Public |
| `POST` | `/api/v1/auth/register/` | Create account | Public |
| `POST` | `/api/v1/auth/login/` | Get JWT tokens | Public |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh access token | Public |
| `POST` | `/api/v1/auth/token/verify/` | Verify token validity | Public |
| `GET` | `/api/v1/auth/profile/` | Get user profile | Bearer |
| `PATCH` | `/api/v1/auth/profile/` | Update profile | Bearer |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh token | Bearer |

---

## Screenshots Section

> 📸 Screenshots will be added after the UI is deployed and verified.

| Page | Description |
|---|---|
| Landing Page | Hero, Features, How It Works, Security, CTA |
| Login | Split layout — brand panel + auth form |
| Register | Validation, privacy promise panel |
| Dashboard | Overview cards, quick actions, placeholders |
| Profile | User info, security settings |
| 404 | Branded error page |

---

## Future Roadmap

### Sprint 2 — Core Features
- Loan CRUD (Create, Read, Update, Delete)
- Payment recording with EMI breakdown
- Receipt file upload (PDF/Image)
- SHA-256 hashing service implementation

### Sprint 3 — Blockchain Integration
- Monad Testnet wallet connection (MetaMask / Rabby)
- Smart contract: `ProofRegistry.sol`
- Hash anchoring transaction
- On-chain verification endpoint

### Sprint 4 — Advanced Features
- Verification portal (public hash lookup)
- PDF report generation
- EMI reminder notification system
- Analytics dashboard (repayment trends)

### Sprint 5 — Production Readiness
- AWS S3 media storage
- Redis for caching and rate limiting
- Docker + docker-compose setup
- CI/CD pipeline (GitHub Actions)
- Mainnet deployment preparation

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributors

| Name | Role |
|---|---|
| Sanatan Labs Team | Architecture, Development, Design |

---

*Built with ❤️ by [Sanatan Labs](https://github.com/sanatan-labs) for the Monad Blockchain Hackathon.*
