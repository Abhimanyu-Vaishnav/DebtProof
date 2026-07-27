/**
 * DebtProof — Quest & Gamification Service
 * Handles user XP points, levels, quest claims, and Monad SBT badge states.
 */
import apiClient from "./api";
import { recordPaymentActivityAndNotification } from "./activity.service";

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  category: "daily" | "milestone" | "boss";
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface QuestStats {
  xp: number;
  level: number;
  streakMonths: number;
  bossHpPercent: number;
  bossName: string;
  bossInterestRate: number;
  bossPrincipal: number;
  claimedQuests: string[];
}

const STORAGE_KEY = "debtproof_quest_stats_v1";

const DEFAULT_QUESTS: QuestItem[] = [
  {
    id: "q-1",
    title: "Anchor Receipt on Monad",
    description: "Upload a payment receipt and generate a SHA-256 cryptographic proof.",
    xpReward: 150,
    icon: "📄",
    category: "daily",
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: "q-2",
    title: "EMI Compliance Streak (3 Months)",
    description: "Pay all monthly EMIs on time for 3 consecutive months.",
    xpReward: 300,
    icon: "🔥",
    category: "milestone",
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: "q-3",
    title: "AI Refinance Audit",
    description: "Run an AI interest reduction simulation for high-rate liabilities.",
    xpReward: 100,
    icon: "💡",
    category: "daily",
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: "q-4",
    title: "Defeat 36% Interest Vampire",
    description: "Make an extra principal payment towards your highest interest debt.",
    xpReward: 500,
    icon: "⚔️",
    category: "boss",
    isCompleted: false,
    isClaimed: false,
  },
];

export function getStoredQuestStats(): QuestStats {
  if (typeof window === "undefined") {
    return {
      xp: 1250,
      level: 4,
      streakMonths: 14,
      bossHpPercent: 65,
      bossName: "ICICI Platinum Credit Card",
      bossInterestRate: 36.0,
      bossPrincipal: 120000,
      claimedQuests: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    xp: 1250,
    level: 4,
    streakMonths: 14,
    bossHpPercent: 65,
    bossName: "ICICI Platinum Credit Card",
    bossInterestRate: 36.0,
    bossPrincipal: 120000,
    claimedQuests: [],
  };
}

export function saveStoredQuestStats(stats: QuestStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPct: number; title: string } {
  const level = Math.floor(xp / 500) + 1;
  const currentXp = xp % 500;
  const nextLevelXp = 500;
  const progressPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  let title = "Debt Apprentice";
  if (level >= 10) title = "Financial Sovereign";
  else if (level >= 7) title = "Interest Slayer";
  else if (level >= 5) title = "Solvency Sentinel";
  else if (level >= 3) title = "Debt Pathfinder";

  return { level, currentXp, nextLevelXp, progressPct, title };
}

export const questService = {
  getQuests: (): QuestItem[] => {
    const stats = getStoredQuestStats();
    return DEFAULT_QUESTS.map((q) => ({
      ...q,
      isClaimed: stats.claimedQuests.includes(q.id),
    }));
  },

  claimQuest: async (questId: string): Promise<{ xpEarned: number; newTotalXp: number }> => {
    const stats = getStoredQuestStats();
    const quest = DEFAULT_QUESTS.find((q) => q.id === questId);
    if (!quest) throw new Error("Quest not found");

    if (!stats.claimedQuests.includes(questId)) {
      stats.claimedQuests.push(questId);
      stats.xp += quest.xpReward;
      const { level } = calculateLevel(stats.xp);
      stats.level = level;
      saveStoredQuestStats(stats);

      // Record activity & trigger notification
      await recordPaymentActivityAndNotification({
        title: `Quest Completed: ${quest.title} (+${quest.xpReward} XP)`,
        description: `Claimed reward for '${quest.title}'. Current Level: ${level}`,
        icon: quest.icon,
        color: "purple",
        event_type: "quest_claimed",
      });
    }

    return { xpEarned: quest.xpReward, newTotalXp: stats.xp };
  },

  attackBoss: async (extraPaymentAmount: number): Promise<{ newHpPercent: number; xpEarned: number; bossDefeated: boolean }> => {
    const stats = getStoredQuestStats();
    const damagePct = Math.min(100, Math.max(15, Math.round((extraPaymentAmount / stats.bossPrincipal) * 100)));
    const newHp = Math.max(0, stats.bossHpPercent - damagePct);
    const bossDefeated = newHp === 0;
    const xpEarned = bossDefeated ? 600 : 200;

    stats.bossHpPercent = newHp;
    stats.xp += xpEarned;
    const { level } = calculateLevel(stats.xp);
    stats.level = level;
    saveStoredQuestStats(stats);

    await recordPaymentActivityAndNotification({
      title: bossDefeated ? `🎉 Boss Defeated! (${stats.bossName})` : `⚔️ Boss Attacked: Dealt ${damagePct}% Damage`,
      description: `Executed extra principal payoff of ₹${extraPaymentAmount.toLocaleString('en-IN')}. (+${xpEarned} XP)`,
      icon: "⚔️",
      color: bossDefeated ? "green" : "purple",
      event_type: "boss_attack",
    });

    return { newHpPercent: newHp, xpEarned, bossDefeated };
  },
};
