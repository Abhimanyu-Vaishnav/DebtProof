/**
 * DebtProof — Shared Global AI Chat State & Context Aware Service
 * Synchronizes messages across the full page (/dashboard/assistant) and global floating widget.
 */

import apiClient from "./api";

export interface SharedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  pageContext?: string;
}

const GLOBAL_CHAT_STORAGE_KEY = "debtproof_shared_ai_messages_v2";
const LISTENERS: Set<(messages: SharedChatMessage[]) => void> = new Set();

const DEFAULT_WELCOME: SharedChatMessage = {
  id: "welcome-shared",
  role: "assistant",
  content: "Namaste! 👋 I am your **DebtProof Unified AI Strategy Coach**.\n\nI am synchronized across your entire workspace! Ask me anything about your current page, active loans, interest savings, or credit score optimization.",
  created_at: new Date().toISOString(),
};

export function getSharedChatMessages(): SharedChatMessage[] {
  if (typeof window === "undefined") return [DEFAULT_WELCOME];
  try {
    const raw = localStorage.getItem(GLOBAL_CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [DEFAULT_WELCOME];
}

export function setSharedChatMessages(messages: SharedChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GLOBAL_CHAT_STORAGE_KEY, JSON.stringify(messages));
    LISTENERS.forEach((listener) => listener([...messages]));
    // Dispatch custom event for same-window component updates
    window.dispatchEvent(new CustomEvent("debtproof_chat_update", { detail: messages }));
  } catch {}
}

export function subscribeToChatMessages(callback: (messages: SharedChatMessage[]) => void): () => void {
  LISTENERS.add(callback);

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) callback(custom.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === GLOBAL_CHAT_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) callback(parsed);
      } catch {}
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("debtproof_chat_update", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    LISTENERS.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("debtproof_chat_update", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}

// Map pathnames to human readable page descriptions and rich context
export function getPageContextDescription(pathname: string): { title: string; hint: string; details: string; detailsEn: string } {
  if (pathname.includes("/dashboard/loans")) {
    return { 
      title: "Loans & Repayment Studio", 
      hint: "Track active bank loans, view amortization schedules, and execute lump-sum foreclosures.",
      details: "Is page par aap apne sabhi active bank loans (Home, Personal, Vehicle, Education) track kar sakte hain. Aap direct loan details dekh sakte hain, custom EMI auto-calculate kar sakte hain, aur Foreclose button daba kar full ya part pre-payment kar sakte hain!",
      detailsEn: "On this page you can manage and track all active bank loans (Home, Personal, Vehicle, Education). You can view amortization schedules, auto-calculate custom EMIs, and execute part or full foreclosures with 1-click!"
    };
  }
  if (pathname.includes("/dashboard/credit-cards")) {
    return { 
      title: "Credit Cards Command Center", 
      hint: "Monitor credit card balances, limits, and credit utilization gauges.",
      details: "Is page par aapke sabhi Credit Cards ki credit limit, current outstanding balance aur bill due dates dikhti hain. Safe credit score (750+) ke liye hamesha credit utilization 30% se kam rakhein!",
      detailsEn: "This page displays your total credit card limits, current outstanding balances, and upcoming due dates. Keep credit utilization below 30% to maintain a 750+ credit score!"
    };
  }
  if (pathname.includes("/dashboard/budget")) {
    return { 
      title: "Budget & Cash Flow Planner", 
      hint: "Manage monthly income streams, living expenses, and EMI safety ratio.",
      details: "Is page par aapki monthly income aur living expenses ka live budget health score dikhta hai. Dhyaan rakhein ki aapki sabhi EMIs ka total aapke monthly budget ke 35% se jyada na ho!",
      detailsEn: "This page calculates your monthly cash flow, living expenses, and Debt-to-Income (DTI) ratio. Ensure your total EMI obligations stay below 35% of monthly income!"
    };
  }
  if (pathname.includes("/dashboard/repayment-simulator")) {
    return { 
      title: "Repayment & Payoff Simulator", 
      hint: "Simulate extra monthly payments and compare Snowball vs Avalanche strategies.",
      details: "Is page par aap interactive slider se test kar sakte hain ki har mahine extra ₹2,000 ya ₹5,000 dene se aapke kitne saal aur kitna interest bachega!",
      detailsEn: "This page features an interactive simulator to model extra monthly EMI contributions and visually compare Debt Snowball vs Debt Avalanche payoff strategies."
    };
  }
  if (pathname.includes("/dashboard/settlement")) {
    return { 
      title: "AI Debt Settlement Studio", 
      hint: "Generate formal One-Time Settlement (OTS) proposal letters for bank lenders.",
      details: "Agar aap distressed hain ya interest rate kam karwana chahte hain, to is page par AI aapke bank ke liye formal One-Time Settlement (OTS) ya Interest Concession letter draft kar deta hai!",
      detailsEn: "On this page, the AI engine drafts formal One-Time Settlement (OTS) proposal letters and interest waiver requests for your lenders."
    };
  }
  if (pathname.includes("/dashboard/statement-import")) {
    return { 
      title: "Bank Statement Auto-Import Parser", 
      hint: "Auto-extract EMI debits and credit card dues from uploaded PDF bank statements.",
      details: "Is page par bank PDF statement upload karke 1-click me saare recurring EMI debits aur bill dues auto-parse kar ke apne portfolio me sync kar sakte hain!",
      detailsEn: "Upload your bank PDF statements on this page to automatically extract and parse recurring EMI debits and credit card dues directly into your portfolio."
    };
  }
  if (pathname.includes("/dashboard/zk-proofs")) {
    return { 
      title: "ZK Credit Proofs & Monad Badges", 
      hint: "Mint zero-knowledge privacy-preserving credit badges on Monad Blockchain.",
      details: "Is page par aap bina apni personal financial privacy reveal kiye, Monad Blockchain par Zero-Knowledge credit score proofs aur Soulbound Badges (SBTs) mint kar sakte hain!",
      detailsEn: "On this page, you can mint Zero-Knowledge privacy-preserving credit score proofs and Soulbound Badges (SBTs) on the Monad Blockchain without revealing your bank statement!"
    };
  }
  if (pathname.includes("/dashboard/reports")) {
    return { 
      title: "Reports & Tax Exemption Exporter", 
      hint: "Export Section 24(b) Home Loan Tax Certificates and No Dues clearance PDFs.",
      details: "Is page se aap FY 2025-26 ke liye Home Loan Interest Tax Exemption (Sec 24b up to ₹2 Lakh) aur Principal Rebate (Sec 80C up to ₹1.5 Lakh) ki official PDF export kar sakte hain!",
      detailsEn: "Export official bank-grade PDFs including Section 24(b) Home Loan Interest Exemption certificates (up to ₹2 Lakhs) and Section 80C principal rebates on this page."
    };
  }
  if (pathname.includes("/dashboard/payoff-quest")) {
    return { 
      title: "Debt Payoff Quest Gamification", 
      hint: "Defeat debt bosses, gain XP, maintain payoff streaks, and mint trophy badges.",
      details: "Is page par debt payoff ko game banaya gaya hai! Har payment se aap debt boss par attack karte hain, XP earn karte hain, aur 25%, 50%, 75% milestones unlock karke Monad NFT trophies claim karte hain!",
      detailsEn: "This page turns debt payoff into an RPG game! Earn XP with every EMI payment, attack debt bosses, and mint Monad NFT trophy badges as you reach 25%, 50%, and 100% repayment milestones."
    };
  }
  return { 
    title: "DebtProof Main Command Dashboard", 
    hint: "Overview of total principal, outstanding debt, repaid progress, and interest burn.",
    details: "Aap abhi DebtProof ke main Command Center dashboard par hain! Yahan aapko overall financial health meter, total outstanding balance, aur monthly payment trends dikhte hain.",
    detailsEn: "You are on the main DebtProof Command Center dashboard! View your overall financial health score, net worth summary, total outstanding liabilities, and active EMI commitments."
  };
}
