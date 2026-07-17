import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ── Google Fonts Optimization ───────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DebtProof — Never Lose Proof of Your Loan Repayments",
    template: "%s | DebtProof",
  },
  description:
    "DebtProof is a blockchain-powered debt management application that creates immutable proof of every loan repayment using cryptographic hashing on Monad Blockchain.",
  keywords: ["loan management", "debt tracking", "blockchain", "payment proof", "Monad", "FinTech"],
  authors: [{ name: "Sanatan Labs" }],
  openGraph: {
    type: "website",
    siteName: "DebtProof",
    title: "DebtProof — Never Lose Proof of Your Loan Repayments",
    description: "Immutable proof of every repayment. Powered by Monad Blockchain.",
  },
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
