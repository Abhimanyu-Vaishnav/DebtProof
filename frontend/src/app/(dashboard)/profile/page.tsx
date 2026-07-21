import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "User Profile | DebtProof",
  description: "Manage your personal credentials, contact info, security settings, and app preferences.",
};

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Account Profile" subtitle="Manage your personal details, contact info, and preferences" />
      <main className="page-content">
        <ProfileClient />
      </main>
    </>
  );
}
