/**
 * DebtProof — Central Theme Manager Utility
 * Supports 7 curated modern themes with complete CSS variable mapping.
 */

export interface ThemeConfig {
  id: string;
  label: string;
  desc: string;
  color: string;
  accent: string;
  icon: string;
  vars: {
    "--color-surface": string;
    "--color-surface-secondary": string;
    "--color-surface-tertiary": string;
    "--color-primary": string;
    "--color-primary-light": string;
    "--color-primary-dark": string;
    "--color-accent": string;
    "--color-text-primary": string;
    "--color-text-secondary": string;
    "--color-border-light": string;
  };
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "dark",
    label: "Dark Titanium",
    desc: "Default sleek dark theme",
    color: "#0f172a",
    accent: "#38bdf8",
    icon: "🌙",
    vars: {
      "--color-surface": "#0f172a",
      "--color-surface-secondary": "#020617",
      "--color-surface-tertiary": "#1e293b",
      "--color-primary": "#38bdf8",
      "--color-primary-light": "#0ea5e9",
      "--color-primary-dark": "#7dd3fc",
      "--color-accent": "#10b981",
      "--color-text-primary": "#f8fafc",
      "--color-text-secondary": "#94a3b8",
      "--color-border-light": "rgba(255, 255, 255, 0.1)",
    },
  },
  {
    id: "midnight",
    label: "Midnight Blue",
    desc: "Indigo violet palette",
    color: "#0f172a",
    accent: "#818cf8",
    icon: "🔷",
    vars: {
      "--color-surface": "#1e1b4b",
      "--color-surface-secondary": "#0f172a",
      "--color-surface-tertiary": "#312e81",
      "--color-primary": "#6366f1",
      "--color-primary-light": "#818cf8",
      "--color-primary-dark": "#a5b4fc",
      "--color-accent": "#818cf8",
      "--color-text-primary": "#e0e7ff",
      "--color-text-secondary": "#c7d2fe",
      "--color-border-light": "rgba(129, 140, 248, 0.2)",
    },
  },
  {
    id: "emerald",
    label: "Deep Emerald",
    desc: "Lush green accent",
    color: "#022c22",
    accent: "#34d399",
    icon: "🌿",
    vars: {
      "--color-surface": "#064e3b",
      "--color-surface-secondary": "#022c22",
      "--color-surface-tertiary": "#065f46",
      "--color-primary": "#10b981",
      "--color-primary-light": "#34d399",
      "--color-primary-dark": "#6ee7b7",
      "--color-accent": "#34d399",
      "--color-text-primary": "#ecfdf5",
      "--color-text-secondary": "#a7f3d0",
      "--color-border-light": "rgba(52, 211, 153, 0.2)",
    },
  },
  {
    id: "cyberpunk",
    label: "Cyber Neon",
    desc: "Vibrant neon magenta & cyan",
    color: "#180b28",
    accent: "#f43f5e",
    icon: "⚡",
    vars: {
      "--color-surface": "#180b28",
      "--color-surface-secondary": "#0d0417",
      "--color-surface-tertiary": "#2c124d",
      "--color-primary": "#e11d48",
      "--color-primary-light": "#fb7185",
      "--color-primary-dark": "#fda4af",
      "--color-accent": "#06b6d4",
      "--color-text-primary": "#fff1f2",
      "--color-text-secondary": "#fecdd3",
      "--color-border-light": "rgba(244, 63, 94, 0.25)",
    },
  },
  {
    id: "sunset",
    label: "Sunset Amber",
    desc: "Warm golden copper glow",
    color: "#1c100b",
    accent: "#f59e0b",
    icon: "🌅",
    vars: {
      "--color-surface": "#2d160c",
      "--color-surface-secondary": "#1c100b",
      "--color-surface-tertiary": "#452213",
      "--color-primary": "#f59e0b",
      "--color-primary-light": "#fbbf24",
      "--color-primary-dark": "#fde68a",
      "--color-accent": "#10b981",
      "--color-text-primary": "#fffbeb",
      "--color-text-secondary": "#fef3c7",
      "--color-border-light": "rgba(245, 158, 11, 0.25)",
    },
  },
  {
    id: "amethyst",
    label: "Amethyst Purple",
    desc: "Rich royal violet dark theme",
    color: "#1e102a",
    accent: "#a855f7",
    icon: "🔮",
    vars: {
      "--color-surface": "#2e1065",
      "--color-surface-secondary": "#1e102a",
      "--color-surface-tertiary": "#3b0764",
      "--color-primary": "#a855f7",
      "--color-primary-light": "#c084fc",
      "--color-primary-dark": "#e9d5ff",
      "--color-accent": "#38bdf8",
      "--color-text-primary": "#faf5ff",
      "--color-text-secondary": "#e9d5ff",
      "--color-border-light": "rgba(168, 85, 247, 0.25)",
    },
  },
  {
    id: "light",
    label: "Clean Light",
    desc: "Clean light contrast theme",
    color: "#ffffff",
    accent: "#10b981",
    icon: "☀️",
    vars: {
      "--color-surface": "#ffffff",
      "--color-surface-secondary": "#f8fafc",
      "--color-surface-tertiary": "#f1f5f9",
      "--color-primary": "#1a3a5c",
      "--color-primary-light": "#2563a8",
      "--color-primary-dark": "#0f2340",
      "--color-accent": "#10b981",
      "--color-text-primary": "#0f172a",
      "--color-text-secondary": "#475569",
      "--color-border-light": "#e2e8f0",
    },
  },
];

export function applyGlobalTheme(themeId: string): void {
  if (typeof window === "undefined") return;
  const config = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const root = document.documentElement;

  Object.entries(config.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  localStorage.setItem("debtproof_theme", themeId);
  window.dispatchEvent(new CustomEvent("debtproof_theme_changed", { detail: themeId }));
}
