/**
 * DebtProof — Landing Page
 * Features, How It Works, Security, CTA sections.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";

export const metadata: Metadata = {
  title: "DebtProof — Never Lose Proof of Your Loan Repayments",
};

// ── Data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Immutable Payment Proof",
    description:
      "Every repayment receipt is hashed with SHA-256 and anchored on Monad Blockchain. Your proof exists forever — no one can tamper with it.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Multi-Loan Management",
    description:
      "Track home loans, personal loans, vehicle loans, and more — all in one clean dashboard with EMI schedules, outstanding amounts, and progress tracking.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Privacy First",
    description:
      "We never store your documents on-chain. Only the cryptographic hash is anchored publicly. Your sensitive information stays private.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Instant Verification",
    description:
      "Verify any payment receipt in seconds. Share your hash with banks, courts, or anyone who needs proof — they can verify independently.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    title: "EMI Reminders",
    description:
      "Never miss an EMI. Get smart reminders before your due date and track upcoming payments across all your active loans.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Audit Trail",
    description:
      "Every action in the system is logged. Complete audit history of all your loan activity with timestamps and context.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Add Your Loan",
    description:
      "Enter your loan details — lender, principal, interest rate, EMI amount, and start date. DebtProof organizes everything in one place.",
  },
  {
    step: "02",
    title: "Record Repayments",
    description:
      "Log each payment with the amount, date, payment method, and bank reference number. Upload your receipt PDF or image.",
  },
  {
    step: "03",
    title: "Generate Cryptographic Hash",
    description:
      "DebtProof computes the SHA-256 hash of your receipt document. This fingerprint uniquely identifies your document.",
  },
  {
    step: "04",
    title: "Anchor on Blockchain",
    description:
      "The hash is stored on Monad Blockchain — immutable, public, and permanent. Your payment proof exists forever.",
  },
];

const SECURITY_POINTS = [
  {
    title: "SHA-256 Hashing",
    description: "Industry-standard cryptographic hash function used by Bitcoin and the entire web.",
  },
  {
    title: "JWT Authentication",
    description: "Stateless, signed tokens for secure API authentication. Automatic rotation and blacklisting.",
  },
  {
    title: "Zero Knowledge of Sensitive Data",
    description: "We never read your document contents. Only the hash is computed and stored.",
  },
  {
    title: "Rate Limiting",
    description: "All APIs are protected against brute-force attacks with intelligent rate limiting.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="hero-section section" aria-labelledby="hero-headline">
          <div className="hero-grid-pattern" />
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-fade-in">
                <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
                Built for Monad Blockchain Hackathon
              </div>

              <h1
                id="hero-headline"
                className="text-white mb-6 animate-fade-in-up"
              >
                Never Lose Proof of Your{" "}
                <span className="text-[var(--color-accent-light)]">Loan Repayments</span>
              </h1>

              <p className="text-lg text-blue-100 leading-relaxed mb-10 animate-fade-in-up delay-100 max-w-2xl mx-auto text-center">
                DebtProof creates immutable cryptographic proof of every payment you make.
                Hash your receipts. Anchor on Monad. Verify forever.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up delay-200">
                <Link href="/register" className="btn btn-accent btn-lg" id="hero-cta-primary">
                  Start for Free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <a href="#how-it-works" className="btn btn-lg text-white border-white/30 hover:bg-white/10 hover:border-white/50">
                  See How It Works
                </a>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10 animate-fade-in-up delay-300">
                {[
                  { value: "SHA-256", label: "Cryptographic Hashing" },
                  { value: "Monad", label: "Blockchain Anchoring" },
                  { value: "100%", label: "Privacy Preserved" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                    <p className="text-xs text-blue-300 mt-0.5 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section id="features" className="section" aria-labelledby="features-heading">
          <div className="container">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-light)] mb-3 block">
                Features
              </span>
              <h2 id="features-heading" className="text-[var(--color-text-primary)]">
                Everything You Need to Manage Debt
              </h2>
              <p className="text-[var(--color-text-secondary)] mt-4 max-w-2xl mx-auto text-center">
                Built for borrowers who want clarity, control, and permanent proof of every repayment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature, i) => (
                <article
                  key={feature.title}
                  className={`card p-6 card-hover animate-fade-in-up`}
                  style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
                >
                  <div className="feature-icon mb-4">{feature.icon}</div>
                  <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          className="section bg-[var(--color-surface)]"
          aria-labelledby="how-it-works-heading"
        >
          <div className="container">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-light)] mb-3 block">
                Process
              </span>
              <h2 id="how-it-works-heading">How DebtProof Works</h2>
              <p className="text-[var(--color-text-secondary)] mt-4 max-w-xl mx-auto text-center">
                From loan to blockchain proof in four simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={step.step} className="relative">
                  {i < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] right-[-2rem] h-px bg-[var(--color-border)]" />
                  )}
                  <div className="card p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security ─────────────────────────────────────── */}
        <section id="security" className="section" aria-labelledby="security-heading">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-light)] mb-3 block">
                  Security
                </span>
                <h2 id="security-heading" className="mb-5">
                  Enterprise-Grade Security
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
                  DebtProof is designed with a security-first mindset. Your financial data 
                  deserves the highest level of protection.
                </p>

                <ul className="space-y-4">
                  {SECURITY_POINTS.map((point) => (
                    <li key={point.title} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{point.title}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{point.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="card p-8 bg-[var(--color-primary-dark)] border-[var(--color-primary)] text-white">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-blue-300 ml-2 font-mono">receipt_verifier.js</span>
                </div>
                <pre className="text-sm font-mono text-blue-100 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`// Verify payment receipt
const hash = sha256(receiptFile);

// Check on Monad Blockchain
const result = await verifyHash({
  hash: hash,
  network: "monad-testnet"
});

// ✅ Verified
console.log(result);
// {
//   verified: true,
//   txHash: "0xabc123...",
//   block: 1234567,
//   timestamp: "2024-01-15"
// }`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="section bg-[var(--color-primary)]" aria-labelledby="cta-heading">
          <div className="container text-center">
            <h2 id="cta-heading" className="text-white mb-5">
              Start Protecting Your Repayments Today
            </h2>
            <p className="text-blue-200 max-w-xl mx-auto mb-8 leading-relaxed text-center">
              Join thousands of borrowers who use DebtProof to create permanent, 
              tamper-proof records of every loan repayment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn btn-accent btn-lg" id="cta-register-btn">
                Create Free Account
              </Link>
              <Link href="/login" className="btn btn-lg text-white border-white/30 hover:bg-white/10">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
