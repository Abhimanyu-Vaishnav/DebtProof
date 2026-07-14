/**
 * DebtProof — Landing Footer
 */
import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[var(--color-primary-dark)] text-white" role="contentinfo">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="font-bold text-[15px]">DebtProof</span>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed max-w-sm">
              Never lose proof of your loan repayments. Powered by cryptographic hashing 
              and Monad Blockchain for immutable payment records.
            </p>
            <p className="text-xs text-blue-300 mt-4">
              A product by{" "}
              <span className="font-semibold text-white">Sanatan Labs</span>
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-4">
              Product
            </h3>
            <ul className="space-y-2.5">
              {["Features", "Security", "How It Works", "Pricing"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-blue-300">
            © {new Date().getFullYear()} Sanatan Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-blue-400">Built on Monad Testnet</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
