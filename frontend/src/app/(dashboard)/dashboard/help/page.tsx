"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";

export default function HelpAboutPage() {
  const faqs = [
    {
      question: "What is DebtProof?",
      answer: "DebtProof is a decentralized personal finance and loan management platform. It allows users to track their traditional loans, manage their net worth, monitor credit cards, and participate in peer-to-peer (P2P) lending using blockchain technology (Monad)."
    },
    {
      question: "How does the P2P Marketplace work?",
      answer: "In the P2P Marketplace, borrowers can list a loan request to be funded by other users via Web3. Once a lender funds the loan using MON tokens on the Monad network, the borrower can withdraw the principal. Repayments are also made on-chain, ensuring a transparent, trustless escrow process without middlemen."
    },
    {
      question: "How is my data secured?",
      answer: "Traditional loan data is stored securely in our backend database, while any P2P escrow loans and receipt hashes are anchored to the Monad blockchain. This dual approach ensures speed for daily operations while providing immutable proof for critical financial transactions."
    },
    {
      question: "Can I track my net worth?",
      answer: "Yes! The Net Worth section allows you to log all your assets (cash, bank accounts, real estate, etc.) and liabilities. The dashboard automatically calculates your total net worth and provides visual distributions of your portfolio."
    },
    {
      question: "What happens if I miss an EMI?",
      answer: "The platform tracks your upcoming EMIs via the Calendar and Dashboard. If you miss a payment, the loan will be marked as overdue and you will receive notifications. In the P2P marketplace, missed payments will be permanently recorded on the blockchain."
    },
    {
      question: "How do I verify a receipt?",
      answer: "You can go to the 'Verify Proof' page and upload any receipt. The system will calculate its cryptographic hash and check if it has been anchored to the Monad blockchain."
    },
    {
      question: "Can I generate PDF reports?",
      answer: "Yes, head over to the 'Reports' section. You can generate detailed CSV or PDF reports of all your loans, payments, and overall financial health."
    }
  ];

  const features = [
    {
      title: "📊 Dashboard & Analytics",
      desc: "Get a bird's-eye view of your financial health, upcoming payments, and debt payoff projections."
    },
    {
      title: "💰 Net Worth Tracker",
      desc: "Log your assets and liabilities to calculate and track your true net worth over time."
    },
    {
      title: "🏦 Loan Management",
      desc: "Track home loans, personal loans, and credit cards. Record EMI payments and keep digital receipts."
    },
    {
      title: "🤝 P2P Web3 Lending",
      desc: "Borrow and lend directly with other users via the Monad blockchain. No banks, complete transparency."
    },
    {
      title: "🔗 Cryptographic Proof",
      desc: "Anchor your important payment receipts to the blockchain for tamper-proof verification."
    },
    {
      title: "📅 Payment Calendar",
      desc: "Never miss a due date with a unified calendar showing all your upcoming EMIs and credit card bills."
    },
    {
      title: "🔔 Smart Notifications",
      desc: "Receive alerts for upcoming payments, overdue EMIs, and successful receipt verifications."
    },
    {
      title: "📱 Mobile Responsive",
      desc: "Access your dashboard and manage your loans seamlessly from any device."
    },
    {
      title: "📈 Financial Projections",
      desc: "Simulate snowball and avalanche strategies to see exactly when you will become completely debt-free."
    }
  ];

  return (
    <>
      <Topbar title="Help & About" subtitle="Learn more about DebtProof and how to use it" />
      <main className="page-content space-y-8">
        
        {/* About Section */}
        <section className="card p-6 bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-surface)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">About DebtProof</h2>
              <p className="text-sm text-[var(--color-primary-light)] font-medium">by Sanatan Labs</p>
            </div>
          </div>
          <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-4xl text-sm">
            DebtProof is designed to bring transparency, efficiency, and decentralization to personal finance. 
            Whether you're looking to aggressively pay down traditional bank loans using our Snowball/Avalanche calculators, 
            or you want to step into the future of decentralized finance by borrowing/lending directly on the blockchain, 
            DebtProof provides the tools you need in one clean, unified interface.
          </p>
        </section>

        {/* Features Grid */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4 px-1">
            Core Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="card p-5 hover:border-[var(--color-primary-light)] transition-colors">
                <h4 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-2">{feature.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4 px-1">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card p-5">
                <h4 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-2 flex items-start gap-2">
                  <span className="text-[var(--color-primary-light)]">Q:</span>
                  {faq.question}
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] pl-6 leading-relaxed">
                  <span className="font-semibold text-[var(--color-text-tertiary)] mr-2">A:</span>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer / Support */}
        <section className="text-center py-8">
          <p className="text-sm text-[var(--color-text-tertiary)] mb-3">Still have questions or need support?</p>
          <button className="btn btn-secondary px-6">
            Contact Support
          </button>
        </section>

      </main>
    </>
  );
}
