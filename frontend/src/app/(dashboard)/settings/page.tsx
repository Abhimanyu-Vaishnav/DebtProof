/**
 * DebtProof — Settings Page
 */
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Settings" };

const SETTINGS_SECTIONS = [
  {
    title: "Notifications",
    items: [
      { label: "EMI Reminders", description: "Get notified 3 days before EMI due date", enabled: true },
      { label: "Payment Confirmed", description: "Notification when payment is recorded", enabled: true },
      { label: "Blockchain Anchored", description: "Alert when receipt hash is anchored on Monad", enabled: false, comingSoon: true },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Currency Format", description: "Display amounts in Indian Rupee (INR)", enabled: true },
      { label: "Date Format", description: "Use DD/MM/YYYY format", enabled: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Customize your DebtProof experience" />
      <main className="page-content max-w-2xl space-y-5">
        {SETTINGS_SECTIONS.map((section) => (
          <Card key={section.title} padding="lg">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <div className="space-y-1">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-3.5 ${
                    i < section.items.length - 1 ? "border-b border-[var(--color-border)]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {item.label}
                      </p>
                      {"comingSoon" in item && item.comingSoon && (
                        <Badge variant="info">Coming Soon</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {/* Toggle */}
                  <button
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${
                      item.enabled
                        ? "bg-[var(--color-accent)]"
                        : "bg-[var(--color-border)]"
                    }`}
                    aria-checked={item.enabled}
                    role="switch"
                    aria-label={item.label}
                    id={`setting-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        item.enabled ? "translate-x-4.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* API Keys — Future */}
        <Card padding="lg" className="opacity-70">
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <Badge variant="neutral">Coming Soon</Badge>
          </CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Generate API keys to integrate DebtProof with your own applications and workflows.
          </p>
        </Card>
      </main>
    </>
  );
}
