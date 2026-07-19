# 15. Complete Developer Guide

This guide describes how to set up, launch, test, and deploy the entire DebtProof platform.

## 1. Backend Service Launch
1. Navigate to the `backend/` directory.
2. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Unix: `source .venv/bin/activate`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Apply database migrations:
   - `python manage.py migrate`
5. Run the web server binding to all network adapters (important for mobile/network access):
   - `python manage.py runserver 0.0.0.0:8000`

---

## 2. Web Frontend Service Launch
1. Navigate to the `frontend/` directory.
2. Install npm packages:
   - `npm install`
3. Launch development server:
   - `npm run dev -- --hostname 0.0.0.0` or `npx next dev --hostname 0.0.0.0`
4. Access the client application locally on `http://localhost:3000` or network-wide on `http://<YOUR_IP>:3000`.

---

## 3. Blockchain Deployment (Hardhat)
1. Navigate to the `blockchain/` directory.
2. Install packages:
   - `npm install`
3. Compile contract:
   - `npx hardhat compile`
4. Run smart contract test suite:
   - `npx hardhat test`
5. Deploy contract to Monad Testnet:
   - Configure private key in `.env`
   - Execute: `npx hardhat run scripts/deploy.js --network monadTestnet`
