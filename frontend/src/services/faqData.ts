/**
 * DebtProof — 50+ Comprehensive Knowledge Items & FAQs Knowledgebase
 * Exported for Knowledgebase UI, search indexing, and AI NLU engine consumption.
 */

export interface FAQItem {
  id: string;
  category: "General" | "Loans & Foreclosure" | "Credit Cards" | "AI Assistant" | "Budgeting & Wealth" | "Security & Web3" | "Customer Support & SLA" | "Reports & Tax";
  q: string;
  a: string;
  tags: string[];
}

export const COMPREHENSIVE_50_FAQS: FAQItem[] = [
  // ── 1. GENERAL & PLATFORM OVERVIEW (1-6) ──
  {
    id: "faq-1",
    category: "General",
    q: "What is DebtProof and how does it help me become debt-free?",
    a: "DebtProof is a modern financial platform designed to track, manage, and accelerate repayment of all loan accounts, credit cards, and debts. It uses AI debt reduction strategies, interactive EMI schedules, and Monad blockchain proof verification to ensure you never lose payment receipts.",
    tags: ["debtproof", "overview", "what is debtproof", "debt free"]
  },
  {
    id: "faq-2",
    category: "General",
    q: "Is DebtProof free to use for managing personal loans?",
    a: "Yes! DebtProof offers a free plan allowing you to track up to 2 active loans with basic EMI calendar and receipt storage. Premium features like AI Debt Strategy Coach, Monad Blockchain proof anchoring, and Snowball vs Avalanche simulators are available in Pro & Premium plans.",
    tags: ["free plan", "pricing", "cost", "subscription"]
  },
  {
    id: "faq-3",
    category: "General",
    q: "Can I use DebtProof on both phone and laptop?",
    a: "Yes! DebtProof is built as a fully responsive Web3 app optimized for mobile smartphones, tablets, and desktop browsers with drag-and-drop support for floating widgets.",
    tags: ["mobile", "desktop", "responsive", "devices"]
  },
  {
    id: "faq-4",
    category: "General",
    q: "How do I create an account on DebtProof?",
    a: "Click on 'Register' on the top right, enter your email address and a strong password. An instant personal organization and workspace will be auto-provisioned for you.",
    tags: ["register", "account", "signup"]
  },
  {
    id: "faq-5",
    category: "General",
    q: "Can I manage multiple financial workspaces or family accounts?",
    a: "Yes, DebtProof supports Joint Workspaces under the Organization settings where you can invite family members or partners to co-manage shared debt portfolios.",
    tags: ["joint workspace", "family", "organization", "multi-user"]
  },
  {
    id: "faq-6",
    category: "General",
    q: "Where can I see my total net worth and debt-to-income ratio?",
    a: "Navigate to the Main Dashboard or Budget Planner. The top KPI cards display Total Borrowed, Total Repaid, Outstanding Balance, and your DTI (Debt-to-Income) ratio indicator.",
    tags: ["net worth", "dti", "dashboard", "kpi"]
  },

  // ── 2. LOANS & FORECLOSURE EXECUTION (7-15) ──
  {
    id: "faq-7",
    category: "Loans & Foreclosure",
    q: "How do I add a new loan to DebtProof?",
    a: "Go to 'My Loans' -> Click '+ Add Loan'. Enter lender name, loan type (Home, Vehicle, Personal), principal amount, interest rate %, monthly EMI, and start/end dates. You can also mark previously paid EMIs during setup.",
    tags: ["add loan", "new loan", "create loan"]
  },
  {
    id: "faq-8",
    category: "Loans & Foreclosure",
    q: "How does the past EMI selection wizard work during loan creation?",
    a: "When creating a loan, Step 2 lets you tick all EMIs you have already paid in the past. DebtProof automatically adjusts the starting principal balance and progress ring so your schedule is 100% accurate from Day 1.",
    tags: ["past emi", "schedule setup", "emi history"]
  },
  {
    id: "faq-9",
    category: "Loans & Foreclosure",
    q: "How do I foreclose or make a part-prepayment on a loan?",
    a: "Open your active Loan Details page -> Click '⚡ Foreclose / Prepay Loan'. Enter your payment amount. The system instantly recalculates your future schedule and displays interest saved.",
    tags: ["foreclose", "prepayment", "part payment", "close loan"]
  },
  {
    id: "faq-10",
    category: "Loans & Foreclosure",
    q: "What happens when a loan is 100% repaid?",
    a: "When outstanding amount reaches zero, the loan status updates to 'Closed', the repayment progress ring fills 100% Green, and you can download an official Zero Debt Clearance Certificate.",
    tags: ["closed loan", "100% repaid", "zero debt certificate"]
  },
  {
    id: "faq-11",
    category: "Loans & Foreclosure",
    q: "How do I parse my CIBIL report or bank PDF statement?",
    a: "Go to My Loans -> Click '📄 Parse CIBIL / Statement'. Upload your PDF statement. Our AI parser extracts active loan accounts, interest rates, and outstanding balances automatically.",
    tags: ["cibil", "pdf parser", "statement import"]
  },
  {
    id: "faq-12",
    category: "Loans & Foreclosure",
    q: "Does DebtProof calculate EMI automatically if I don't know the exact figure?",
    a: "Yes! When you input principal amount, annual interest rate, and tenure months, the built-in reducing balance formula computes your exact monthly EMI.",
    tags: ["emi calculation", "reducing balance", "tenure"]
  },
  {
    id: "faq-13",
    category: "Loans & Foreclosure",
    q: "Can I record custom notes or reference numbers for EMI payments?",
    a: "Yes, when clicking 'Record Payment', you can attach payment method (UPI, NEFT, Auto Debit), reference transaction ID, notes, and upload the payment receipt.",
    tags: ["record payment", "receipt upload", "reference id"]
  },
  {
    id: "faq-14",
    category: "Loans & Foreclosure",
    q: "What is reducing balance interest vs flat interest rate?",
    a: "Flat rate calculates interest on initial principal for the full tenure, while reducing balance calculates interest only on the remaining unpaid principal balance each month.",
    tags: ["reducing balance", "flat interest", "calculation"]
  },
  {
    id: "faq-15",
    category: "Loans & Foreclosure",
    q: "Can I edit an existing loan's interest rate if bank changes repo rate?",
    a: "Yes! Open loan detail page -> Click 'Edit Loan' -> Update the interest rate %. The future amortization schedule updates instantly.",
    tags: ["edit loan", "repo rate", "interest change"]
  },

  // ── 3. AI ASSISTANT & BILINGUAL NLU (16-23) ──
  {
    id: "faq-16",
    category: "AI Assistant",
    q: "How does the AI Financial Strategy Coach work?",
    a: "DebtProof AI is connected directly to your active database portfolio. It analyzes your real loans, total interest burn, and cash flow to give personalized advice rather than generic tips.",
    tags: ["ai coach", "ai assistant", "nlu"]
  },
  {
    id: "faq-17",
    category: "AI Assistant",
    q: "Does the AI Assistant speak Hindi and Hinglish?",
    a: "Yes! Our AI features bilingual language detection. If you ask in Hindi e.g. 'Mera kaunsa loan sabse pehle bharein?', it responds in clear Hindi/Hinglish with your exact loan names.",
    tags: ["hindi ai", "hinglish", "bilingual", "language"]
  },
  {
    id: "faq-18",
    category: "AI Assistant",
    q: "Is the floating AI Coach synced with the main AI Assistant page?",
    a: "Yes! Messages typed in the floating widget (/dashboard) instantly sync with the full Assistant Studio page (/dashboard/assistant) and vice-versa in real-time.",
    tags: ["sync chat", "floating widget", "assistant page"]
  },
  {
    id: "faq-19",
    category: "AI Assistant",
    q: "Can the AI Coach tell me about the features of the current page I am viewing?",
    a: "Yes! The floating AI Coach detects your current active page URL and provides contextual guidance, usage steps, and answer queries regarding that page.",
    tags: ["page context", "current page", "contextual help"]
  },
  {
    id: "faq-20",
    category: "AI Assistant",
    q: "How do I move or drag the floating AI Coach window?",
    a: "Press and hold the top header handle of the floating coach window on mobile touchscreens or PC mouse cursor to drag and place it anywhere on your screen.",
    tags: ["draggable", "floating window", "move widget"]
  },
  {
    id: "faq-21",
    category: "AI Assistant",
    q: "Can I talk to the AI Coach using Voice commands?",
    a: "Yes! Click the Microphone icon inside the AI Coach or Voice Studio. Speak your query and the AI will transcribe your voice and speak back the answer.",
    tags: ["voice assistant", "speech recognition", "mic"]
  },
  {
    id: "faq-22",
    category: "AI Assistant",
    q: "What questions can I ask the AI Financial Coach?",
    a: "You can ask: 'Total interestkitna bacha sakte hain?', 'Kaunsa card pehle bharein?', 'How much interest paid this year?', or 'Explain how to foreclose my home loan'.",
    tags: ["ai questions", "example prompts"]
  },
  {
    id: "faq-23",
    category: "AI Assistant",
    q: "Is my conversation with the AI Coach private?",
    a: "Yes, all chat conversations are encrypted and accessible only within your authenticated session.",
    tags: ["privacy", "chat encryption"]
  },

  // ── 4. CREDIT CARDS & BUDGETING (24-31) ──
  {
    id: "faq-24",
    category: "Credit Cards",
    q: "How do I manage credit cards in DebtProof?",
    a: "Go to 'Credit Cards' -> Click '+ Add Credit Card'. Enter card issuer, credit limit, current statement balance, minimum due, and due date.",
    tags: ["credit cards", "card limit", "billing"]
  },
  {
    id: "faq-25",
    category: "Credit Cards",
    q: "What is Credit Utilization Ratio and why is it important?",
    a: "Credit Utilization is the percentage of total credit limit currently used. Keeping utilization below 30% boosts your CIBIL credit score.",
    tags: ["credit utilization", "cibil score", "credit limit"]
  },
  {
    id: "faq-26",
    category: "Credit Cards",
    q: "How does the Budget Planner calculate DTI (Debt-to-Income)?",
    a: "Budget Planner sums all active monthly EMIs + minimum card payments and divides by total net monthly income. DTI below 35% is considered safe.",
    tags: ["dti", "budget planner", "income sync"]
  },
  {
    id: "faq-27",
    category: "Credit Cards",
    q: "Does Budget Planner sync 2-way with the main Dashboard?",
    a: "Yes! Any changes made to income sources or living expenses in Budget Planner instantly update your Dashboard Cash Flow gauge.",
    tags: ["2 way sync", "budget sync", "dashboard"]
  },
  {
    id: "faq-28",
    category: "Credit Cards",
    q: "What is the Cash Flow Allocation metric?",
    a: "It breaks down your monthly income into EMIs & Debt Repayment, Living Expenses, Savings/Investments, and Free Surplus Cash Flow.",
    tags: ["cash flow", "surplus", "allocation"]
  },
  {
    id: "faq-29",
    category: "Credit Cards",
    q: "Can I set custom budget expense caps for categories like Rent or Food?",
    a: "Yes, Budget Planner lets you define target spending caps for each category and alerts you if expense exceeds target.",
    tags: ["expense caps", "budget limit"]
  },
  {
    id: "faq-30",
    category: "Credit Cards",
    q: "What happens if my credit card bill statement is paid in full?",
    a: "Record the payment under Credit Cards. The active card balance resets to zero and credit utilization gauge updates dynamically.",
    tags: ["card payment", "zero balance"]
  },
  {
    id: "faq-31",
    category: "Credit Cards",
    q: "Does DebtProof send payment due date reminders?",
    a: "Yes! Automated email and dashboard notifications trigger 5 days and 1 day before any EMI or card due date.",
    tags: ["reminders", "due date alert"]
  },

  // ── 5. REPAYMENT SIMULATION & WEALTH (32-38) ──
  {
    id: "faq-32",
    category: "Budgeting & Wealth",
    q: "What is the difference between Debt Avalanche and Debt Snowball?",
    a: "Debt Avalanche pays highest interest rate loan first (saves maximum money). Debt Snowball pays smallest balance loan first (gives fast psychological wins).",
    tags: ["avalanche", "snowball", "payoff strategy"]
  },
  {
    id: "faq-33",
    category: "Budgeting & Wealth",
    q: "How does the Repayment Simulator calculate debt-free target date?",
    a: "By simulating an extra monthly payment slider (₹1,000 – ₹50,000), it re-runs amortization schedules across all loans to project exact debt freedom month.",
    tags: ["simulator", "target date", "extra emi"]
  },
  {
    id: "faq-34",
    category: "Budgeting & Wealth",
    q: "How does the Compound Wealth Predictor work in Investments?",
    a: "It calculates compound interest growth over 1, 3, 5, and 10 years based on asset valuation and expected CAGR %.",
    tags: ["compound wealth", "cagr", "investments"]
  },
  {
    id: "faq-35",
    category: "Budgeting & Wealth",
    q: "What asset classes can I track under Investments?",
    a: "Mutual Funds, Stocks, Fixed Deposits (FDs), Real Estate, Gold, Crypto, and Provident Fund (EPF/PPF).",
    tags: ["asset classes", "stocks", "mutual funds"]
  },
  {
    id: "faq-36",
    category: "Budgeting & Wealth",
    q: "What is the Auto-Saver Micro Savings feature?",
    a: "Auto-Saver rounds up your everyday transaction amounts to the nearest ₹10 or ₹50 and accumulates spare change to pay off loan principal.",
    tags: ["auto saver", "micro savings", "roundup"]
  },
  {
    id: "faq-37",
    category: "Budgeting & Wealth",
    q: "Can I simulate refinancing my home loan to another bank?",
    a: "Yes! Open 'Refinance Simulator' -> Enter existing loan interest rate vs new lender rate & processing fee to view net savings after switching.",
    tags: ["refinance", "balance transfer", "bank switch"]
  },
  {
    id: "faq-38",
    category: "Budgeting & Wealth",
    q: "How do I calculate Section 24(b) tax savings on home loan interest?",
    a: "Go to Analytics -> Tax Savings Studio. Input annual interest paid to view deductible tax savings up to ₹2,00,000 under Income Tax Act.",
    tags: ["tax savings", "section 24b", "home loan tax"]
  },

  // ── 6. MONAD BLOCKCHAIN & SECURITY (39-44) ──
  {
    id: "faq-39",
    category: "Security & Web3",
    q: "What is Monad Blockchain receipt proof anchoring?",
    a: "When you upload a payment receipt, DebtProof generates a SHA-256 cryptographic hash and writes it to Monad Testnet blockchain for immutable proof.",
    tags: ["monad", "blockchain", "sha256", "receipt anchoring"]
  },
  {
    id: "faq-40",
    category: "Security & Web3",
    q: "How do I verify a blockchain receipt proof on Monad Explorer?",
    a: "Go to 'Receipt Vault' or click 'Verify Proof'. Enter your transaction proof ID to view block timestamp and Monad explorer transaction hash.",
    tags: ["verify proof", "monad explorer", "tx hash"]
  },
  {
    id: "faq-41",
    category: "Security & Web3",
    q: "What are Zero Knowledge (ZK) Credit Proofs?",
    a: "ZK Proofs allow you to mathematically prove your creditworthiness or debt-free status to landlords or lenders without revealing sensitive loan numbers.",
    tags: ["zk proofs", "privacy", "zero knowledge"]
  },
  {
    id: "faq-42",
    category: "Security & Web3",
    q: "Do I need a Web3 wallet (MetaMask) to use DebtProof?",
    a: "No! Web3 wallet connection is optional for blockchain anchoring. All regular loan tracking features work seamlessly with traditional email login.",
    tags: ["metamask", "web3 wallet", "login"]
  },
  {
    id: "faq-43",
    category: "Security & Web3",
    q: "How is my password and database data secured?",
    a: "Passwords use Argon2/PBKDF2 hashing, API requests use JWT bearer tokens, and PostgreSQL data is stored with multi-tenant isolation.",
    tags: ["security", "encryption", "jwt"]
  },
  {
    id: "faq-44",
    category: "Security & Web3",
    q: "Can I export a complete backup of my data?",
    a: "Yes! Go to Settings or Reports -> Click 'Export JSON Data' to download a complete local copy of your portfolio records.",
    tags: ["export data", "backup", "json export"]
  },

  // ── 7. MULTI-TIER CUSTOMER SUPPORT & ADMIN (45-50) ──
  {
    id: "faq-45",
    category: "Customer Support & SLA",
    q: "How does the Multi-Tier Customer Support ticketing system work?",
    a: "When you raise a support ticket, it connects you to Level-1 Support. If backend account changes are needed, the agent escalates it to Support Manager or SuperAdmin.",
    tags: ["support ticket", "escalation", "customer support"]
  },
  {
    id: "faq-46",
    category: "Customer Support & SLA",
    q: "How fast does the customer support team respond?",
    a: "Level-1 Support responds within 15 minutes for High/Urgent priority tickets and within 2 hours for standard queries.",
    tags: ["response time", "sla", "support speed"]
  },
  {
    id: "faq-47",
    category: "Customer Support & SLA",
    q: "Can Support Managers or SuperAdmin intervene in live ticket chats?",
    a: "Yes! SuperAdmins and Support Managers have access to the Admin Support Inspection Studio to monitor live agent chats and provide instant resolution.",
    tags: ["live chat inspection", "admin intervention", "chat monitor"]
  },
  {
    id: "faq-48",
    category: "Customer Support & SLA",
    q: "Where can I view my open and past support tickets?",
    a: "Go to Help Center (/dashboard/help) -> Click 'My Active Support Tickets' tab to view conversation logs and representative assignments.",
    tags: ["my tickets", "ticket status"]
  },
  {
    id: "faq-49",
    category: "Reports & Tax",
    q: "How do I generate a print-ready PDF statement for my bank?",
    a: "Go to Reports -> Select 'Loan Portfolio Statement' -> Apply date range -> Click '📄 Export PDF'.",
    tags: ["pdf statement", "bank report", "export pdf"]
  },
  {
    id: "faq-50",
    category: "Reports & Tax",
    q: "How do I download my official Zero Debt Clearance Certificate?",
    a: "When a loan is 100% repaid, open the loan page or Reports client -> Click 'Download Debt Freedom Certificate' to get a stamped PDF certificate.",
    tags: ["clearance certificate", "zero debt pdf"]
  },
];

/**
 * Utility helper to search FAQs by keyword or natural language query
 */
export function searchFAQS(query: string): FAQItem[] {
  if (!query || !query.trim()) return COMPREHENSIVE_50_FAQS;
  const q = query.toLowerCase().trim();
  return COMPREHENSIVE_50_FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(q) ||
      f.a.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
  );
}
