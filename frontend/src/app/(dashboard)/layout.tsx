import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { GlobalFloatingUI } from "@/components/ui/GlobalFloatingUI";

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
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
      <BottomTabBar />
      {/* Client-hydrated Global floating UI */}
      <GlobalFloatingUI />
    </div>
  );
}
