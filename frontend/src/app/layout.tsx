import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#38bdf8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "DebtProof — Never Lose Proof of Your Loan Repayments",
    template: "%s | DebtProof",
  },
  description:
    "DebtProof is a blockchain-powered debt management application that creates immutable proof of every loan repayment using cryptographic hashing on Monad Blockchain.",
  keywords: ["loan management", "debt tracking", "blockchain", "payment proof", "Monad", "FinTech", "budget planner", "EMI tracker"],
  authors: [{ name: "Sanatan Labs" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DebtProof",
  },
  openGraph: {
    type: "website",
    siteName: "DebtProof",
    title: "DebtProof — Never Lose Proof of Your Loan Repayments",
    description: "Immutable proof of every repayment. Powered by Monad Blockchain.",
  },
};

import { ToastProvider } from "@/components/ui/Toast";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";

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
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DebtProof" />
        <meta name="application-name" content="DebtProof" />
        <meta name="msapplication-TileColor" content="#0f172a" />
      </head>
      <body>
        <CurrencyProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CurrencyProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
