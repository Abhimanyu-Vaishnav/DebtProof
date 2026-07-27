import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | DebtProof",
  },
  robots: { index: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">{children}</div>
        <BottomTabBar />
      </div>
    </ClientProviders>
  );
}
