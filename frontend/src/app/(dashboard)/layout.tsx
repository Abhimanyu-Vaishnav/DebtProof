import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { EMIReminderPopup } from "@/components/ui/EMIReminderPopup";
import { InstallPWABanner } from "@/components/ui/InstallPWABanner";
import { AIDebtPayoffAssistant } from "@/components/dashboard/AIDebtPayoffAssistant";

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
      {/* Global floating UI */}
      <EMIReminderPopup />
      <InstallPWABanner />
      <AIDebtPayoffAssistant />
    </div>
  );
}
