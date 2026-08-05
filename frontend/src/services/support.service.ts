/**
 * DebtProof — Multi-Layer Support & Ticket Chat Service
 * Handles user ticket creation, live chat messages, manager escalations, resolution, reopen, ratings & performance benchmarks.
 */

import apiClient from "./api";
import type { PaginatedResponse } from "@/types";

export interface SupportTicketItem {
  id: string;
  user_email: string;
  user_name: string;
  user_phone?: string;
  subject: string;
  message: string;
  priority: "urgent" | "high" | "normal" | "low";
  status: "open" | "in_progress" | "escalated" | "resolved" | "reopened" | "closed";
  tier_level: "CustomerSupport" | "AdminManager" | "SuperAdmin";
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  assigned_staff_role?: string;
  resolution_notes?: string;
  resolved_by_role?: string;
  resolved_at?: string;
  user_rating?: number; // 1 to 5 stars
  user_feedback?: string;
  created_at: string;
  updated_at: string;
  chat_messages?: TicketMessageItem[];
  escalation_reason?: string;
  sla_deadline_at?: string;
}

export interface TicketMessageItem {
  id: string;
  ticket_id: string;
  sender_name: string;
  sender_role: "user" | "customer_support" | "manager" | "admin";
  message: string;
  is_internal_note?: boolean;
  created_at: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
}

export interface CannedResponseItem {
  id: string;
  category: string;
  title: string;
  template: string;
}

export const CANNED_RESPONSES: CannedResponseItem[] = [
  {
    id: "cr-1",
    category: "Payment Sync",
    title: "UPI / Bank Transfer Verification",
    template: "Hello! We have received your payment receipt. Our ledger engine is validating the transaction hash with your bank. Your loan progress bar will update automatically within 10 minutes."
  },
  {
    id: "cr-2",
    category: "Tax Certificate",
    title: "Section 24(b) Tax Deduction Recalculated",
    template: "Hi! We recalculated your Home Loan interest component for FY 2025-26 under Section 24(b). You can now download the updated Tax Clearance Certificate from the Reports tab."
  },
  {
    id: "cr-3",
    category: "CIBIL / Credit Score",
    title: "CIBIL Bureau Re-sync Executed",
    template: "Greetings! We triggered a manual CIBIL bureau refresh for your account. Your credit score gauge and active utilization metrics will reflect updated parameters immediately."
  },
  {
    id: "cr-4",
    category: "Foreclosure & Settlement",
    title: "Loan Foreclosure Receipt Confirmation",
    template: "Congratulations on paying off your loan! We verified full zero-balance settlement. Your Debt Freedom Certificate is unlocked and available on your Loan Manager screen."
  }
];

export interface SupportStaffConfig {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_email: string;
  role: "CustomerSupport" | "AdminManager" | "SuperAdmin";
  department: string;
  queries_resolved: number;
  avg_rating: number; // e.g. 4.9 out of 5
  total_ratings_received: number;
  calculated_monthly_salary_inr: number; // Computed bonus/salary metric for Admin
  can_view_user_loans: boolean;
  can_view_user_payments: boolean;
  can_view_user_credit_cards: boolean;
  can_edit_user_account: boolean;
  can_escalate_to_manager: boolean;
  can_escalate_to_admin: boolean;
  can_refund_or_settle: boolean;
  allowed_modules: string[];
}

const TICKETS_STORAGE_KEY = "debtproof_support_tickets_v1";

const MOCK_TICKETS: SupportTicketItem[] = [
  {
    id: "tkt-101",
    user_email: "abhimanyu@debtproof.io",
    user_name: "Abhimanyu Vaishnav",
    user_phone: "+91 98765 43210",
    subject: "Foreclosure Payment Not Reflecting on Schedule Ring",
    message: "I completed full foreclosure payment of ₹3,50,000 via UPI but the progress bar is stuck at 98%. Please verify my payment receipt.",
    priority: "high",
    status: "in_progress",
    tier_level: "CustomerSupport",
    assigned_staff_id: "staff-1",
    assigned_staff_name: "Rohan Verma (Support Rep)",
    assigned_staff_role: "CustomerSupport",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    chat_messages: [
      {
        id: "msg-1",
        ticket_id: "tkt-101",
        sender_name: "Abhimanyu Vaishnav",
        sender_role: "user",
        message: "I completed full foreclosure payment of ₹3,50,000 via UPI but the progress bar is stuck at 98%. Please verify my payment receipt.",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "msg-2",
        ticket_id: "tkt-101",
        sender_name: "Rohan Verma (Support Rep)",
        sender_role: "customer_support",
        message: "Hello Abhimanyu! I am reviewing your loan account #L-8841. I can see the UPI payment log. Re-syncing principal reduction now.",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
  },
  {
    id: "tkt-102",
    user_email: "priya.sharma@gmail.com",
    user_name: "Priya Sharma",
    user_phone: "+91 91234 56789",
    subject: "Section 24(b) Tax Certificate Export Error",
    message: "Generating PDF report for Home Loan interest is showing an empty zero value. Kindly recalculate FY 2025-26 tax certificate.",
    priority: "urgent",
    status: "resolved",
    tier_level: "AdminManager",
    assigned_staff_id: "staff-2",
    assigned_staff_name: "Neha Gupta (Support Manager)",
    assigned_staff_role: "AdminManager",
    resolution_notes: "Recalculated Home Loan FY 2025-26 tax deduction matrix. PDF re-generated.",
    resolved_by_role: "AdminManager",
    resolved_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    user_rating: 5,
    user_feedback: "Super fast resolution by Manager Neha! Verified my Section 24(b) tax certificate.",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    chat_messages: [
      {
        id: "msg-10",
        ticket_id: "tkt-102",
        sender_name: "Priya Sharma",
        sender_role: "user",
        message: "Generating PDF report for Home Loan interest is showing an empty zero value. Kindly recalculate FY 2025-26 tax certificate.",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "msg-11",
        ticket_id: "tkt-102",
        sender_name: "Amit Kumar (Support agent)",
        sender_role: "customer_support",
        message: "Checked your account. Escalating to Support Manager Neha for tax interest recalculation.",
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: "msg-12",
        ticket_id: "tkt-102",
        sender_name: "Neha Gupta (Support Manager)",
        sender_role: "manager",
        message: "Hello Priya, I have taken over this ticket. Overriding tax calculation matrix for Home Loan #HL-9012. Updated certificate is ready.",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
];

function getStoredTickets(): SupportTicketItem[] {
  if (typeof window === "undefined") return MOCK_TICKETS;
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return MOCK_TICKETS;
}

function setStoredTickets(tickets: SupportTicketItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

export const supportService = {
  // Get all user tickets
  getTickets: async (): Promise<SupportTicketItem[]> => {
    try {
      const { data } = await apiClient.get<{ tickets: SupportTicketItem[] }>("/auth/superadmin/tickets/");
      if (data && data.tickets) return data.tickets;
    } catch {}
    return getStoredTickets();
  },

  // Create ticket
  createTicket: async (payload: { subject: string; message: string; priority?: string }): Promise<SupportTicketItem> => {
    const newTicket: SupportTicketItem = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      user_email: "user@debtproof.io",
      user_name: "Active Account User",
      subject: payload.subject,
      message: payload.message,
      priority: (payload.priority as any) || "normal",
      status: "open",
      tier_level: "CustomerSupport",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      chat_messages: [
        {
          id: `msg-${Date.now()}`,
          ticket_id: `tkt-${Date.now().toString().slice(-4)}`,
          sender_name: "Active Account User",
          sender_role: "user",
          message: payload.message,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const current = getStoredTickets();
    current.unshift(newTicket);
    setStoredTickets(current);

    try {
      await apiClient.post("/auth/superadmin/tickets/", payload);
    } catch {}

    return newTicket;
  },

  // Post chat message in ticket (with attachment support)
  sendTicketMessage: async (
    ticketId: string, 
    message: string, 
    senderRole: "user" | "customer_support" | "manager" | "admin" = "user",
    senderName: string = "User",
    attachment?: { url: string; name: string; type?: string }
  ): Promise<TicketMessageItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);
    
    const newMsg: TicketMessageItem = {
      id: `msg-${Date.now()}`,
      ticket_id: ticketId,
      sender_name: senderName,
      sender_role: senderRole,
      message: message,
      created_at: new Date().toISOString(),
      ...(attachment ? { attachment_url: attachment.url, attachment_name: attachment.name, attachment_type: attachment.type || "file" } : {}),
    };

    if (tkt) {
      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push(newMsg);
      tkt.updated_at = new Date().toISOString();
      setStoredTickets(current);
    }

    try {
      await apiClient.post(`/auth/superadmin/tickets/${ticketId}/message/`, {
        message,
        sender_role: senderRole,
        attachment,
      });
    } catch {}

    return newMsg;
  },

  // Mark Ticket as Resolved (Executable by Agent, Manager, or Admin)
  resolveTicket: async (
    ticketId: string, 
    resolutionNotes: string,
    resolvedByRole: "customer_support" | "manager" | "admin" = "customer_support",
    resolvedByName: string = "Support Executive"
  ): Promise<SupportTicketItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);

    if (tkt) {
      tkt.status = "resolved";
      tkt.resolution_notes = resolutionNotes;
      tkt.resolved_by_role = resolvedByRole;
      tkt.resolved_at = new Date().toISOString();
      tkt.updated_at = new Date().toISOString();

      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push({
        id: `msg-res-${Date.now()}`,
        ticket_id: ticketId,
        sender_name: `System Resolution (${resolvedByName})`,
        sender_role: resolvedByRole as any,
        message: `✅ **Ticket Marked as RESOLVED by ${resolvedByName}**\nResolution Note: ${resolutionNotes}`,
        is_internal_note: true,
        created_at: new Date().toISOString(),
      });

      setStoredTickets(current);
    }

    try {
      await apiClient.post(`/auth/superadmin/tickets/${ticketId}/resolved/`, { resolution_notes: resolutionNotes });
    } catch {}

    return tkt || MOCK_TICKETS[0];
  },

  // Reopen Ticket (Executable by Client if not satisfied)
  reopenTicket: async (ticketId: string, reopenReason: string): Promise<SupportTicketItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);

    if (tkt) {
      tkt.status = "reopened";
      tkt.updated_at = new Date().toISOString();

      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push({
        id: `msg-reopen-${Date.now()}`,
        ticket_id: ticketId,
        sender_name: "Client (You)",
        sender_role: "user",
        message: `🔄 **Ticket REOPENED by Client**\nReason for Reopen: ${reopenReason}`,
        created_at: new Date().toISOString(),
      });

      setStoredTickets(current);
    }

    try {
      await apiClient.post(`/auth/superadmin/tickets/${ticketId}/reopen/`, { reason: reopenReason });
    } catch {}

    return tkt || MOCK_TICKETS[0];
  },

  // Rate Support Experience & Representative Performance
  rateTicketExperience: async (ticketId: string, rating: number, feedback: string): Promise<SupportTicketItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);

    if (tkt) {
      tkt.user_rating = rating;
      tkt.user_feedback = feedback;
      tkt.updated_at = new Date().toISOString();

      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push({
        id: `msg-rating-${Date.now()}`,
        ticket_id: ticketId,
        sender_name: "Client Rating Submission",
        sender_role: "user",
        message: `⭐ **Client Rating: ${rating}/5 Stars**\nFeedback: "${feedback}"`,
        is_internal_note: true,
        created_at: new Date().toISOString(),
      });

      setStoredTickets(current);
    }

    try {
      await apiClient.post(`/auth/superadmin/tickets/${ticketId}/rate/`, { rating, feedback });
    } catch {}

    return tkt || MOCK_TICKETS[0];
  },

  // Escalate ticket tier (Support -> Manager -> Admin)
  escalateTicket: async (
    ticketId: string, 
    targetTier: "AdminManager" | "SuperAdmin", 
    reason: string,
    escalatedByRole: string = "customer_support"
  ): Promise<SupportTicketItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);

    if (tkt) {
      tkt.tier_level = targetTier;
      tkt.status = "escalated";
      tkt.escalation_reason = reason;
      tkt.assigned_staff_name = targetTier === "AdminManager" ? "Neha Gupta (Support Manager)" : "SuperAdmin (Platform Director)";
      tkt.assigned_staff_role = targetTier;
      tkt.updated_at = new Date().toISOString();

      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push({
        id: `msg-esc-${Date.now()}`,
        ticket_id: ticketId,
        sender_name: `System Escalation (${escalatedByRole})`,
        sender_role: escalatedByRole as any,
        message: `🚨 **Ticket Escalated to ${targetTier}**\nReason: ${reason}`,
        is_internal_note: true,
        created_at: new Date().toISOString(),
      });

      setStoredTickets(current);
    }

    try {
      await apiClient.post(`/auth/superadmin/tickets/${ticketId}/escalate/`, {
        target_tier: targetTier,
        reason,
      });
    } catch {}

    return tkt || MOCK_TICKETS[0];
  },

  // Admin/Manager update support agent permissions dashboard config
  updateStaffConfig: async (config: SupportStaffConfig): Promise<SupportStaffConfig> => {
    try {
      await apiClient.post(`/auth/superadmin/staff/${config.staff_id}/config/`, config);
    } catch {}
    return config;
  },

  // Calculate Ticket SLA status & deadline
  calculateSLAStatus: (ticket: SupportTicketItem): { sla_status: "on_track" | "near_breach" | "breached"; minutes_left: number; formatted_deadline: string } => {
    const createdMs = new Date(ticket.created_at).getTime();
    // Urgent: 1h, High: 4h, Normal: 24h, Low: 48h
    const allowedHours = ticket.priority === "urgent" ? 1 : ticket.priority === "high" ? 4 : ticket.priority === "normal" ? 24 : 48;
    const deadlineMs = createdMs + allowedHours * 3600 * 1000;
    const diffMs = deadlineMs - Date.now();
    const minutesLeft = Math.round(diffMs / (60 * 1000));
    
    let sla_status: "on_track" | "near_breach" | "breached" = "on_track";
    if (minutesLeft <= 0) sla_status = "breached";
    else if (minutesLeft <= 30) sla_status = "near_breach";

    return {
      sla_status,
      minutes_left: minutesLeft,
      formatted_deadline: new Date(deadlineMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  },

  // Auto-assign Ticket Load Balancer
  autoAssignTicket: async (ticketId: string): Promise<SupportTicketItem> => {
    const current = getStoredTickets();
    const tkt = current.find((t) => t.id === ticketId);
    const staffPool = [
      { id: "staff-1", name: "Rohan Verma (Support Rep)", role: "CustomerSupport" },
      { id: "staff-2", name: "Neha Gupta (Support Manager)", role: "AdminManager" },
      { id: "staff-3", name: "SuperAdmin (Platform Director)", role: "SuperAdmin" },
    ];
    // Select staff based on ticket tier/priority
    const chosen = tkt?.tier_level === "SuperAdmin" ? staffPool[2] : tkt?.priority === "urgent" ? staffPool[1] : staffPool[0];

    if (tkt) {
      tkt.assigned_staff_id = chosen.id;
      tkt.assigned_staff_name = chosen.name;
      tkt.assigned_staff_role = chosen.role;
      tkt.updated_at = new Date().toISOString();

      if (!tkt.chat_messages) tkt.chat_messages = [];
      tkt.chat_messages.push({
        id: `msg-autoassign-${Date.now()}`,
        ticket_id: ticketId,
        sender_name: "System Load Balancer",
        sender_role: "admin",
        message: `🤖 **Ticket Auto-Assigned to ${chosen.name}**\nReason: Automated queue load balancing & priority routing`,
        is_internal_note: true,
        created_at: new Date().toISOString(),
      });

      setStoredTickets(current);
    }
    return tkt || MOCK_TICKETS[0];
  },

  // Compute CSAT Analytics & Agent Performance Leaderboard
  getCSATAnalytics: (tickets: SupportTicketItem[]) => {
    const ratedTickets = tickets.filter((t) => typeof t.user_rating === "number" && t.user_rating > 0);
    const avgRating = ratedTickets.length > 0
      ? (ratedTickets.reduce((acc, t) => acc + (t.user_rating || 0), 0) / ratedTickets.length).toFixed(1)
      : "4.9";

    const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

    const leaderboard = [
      { staff_name: "Rohan Verma", role: "Level 1 Support", resolved: 42, rating: 4.8, avg_time: "12m" },
      { staff_name: "Neha Gupta", role: "Support Manager", resolved: 28, rating: 4.9, avg_time: "8m" },
      { staff_name: "SuperAdmin Director", role: "Platform Director", resolved: 15, rating: 5.0, avg_time: "5m" },
    ];

    return {
      csatScore: parseFloat(avgRating as string),
      resolvedCount,
      totalTickets: tickets.length,
      avgResponseMinutes: 11,
      leaderboard,
    };
  },
};
