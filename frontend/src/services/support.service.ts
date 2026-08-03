/**
 * DebtProof — Multi-Layer Support & Ticket Chat Service
 * Handles user ticket creation, live chat messages, manager escalations, and admin staff management with demo fallbacks.
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
  status: "open" | "in_progress" | "escalated" | "resolved" | "closed";
  tier_level: "CustomerSupport" | "AdminManager" | "SuperAdmin";
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  assigned_staff_role?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  chat_messages?: TicketMessageItem[];
  escalation_reason?: string;
}

export interface TicketMessageItem {
  id: string;
  ticket_id: string;
  sender_name: string;
  sender_role: "user" | "customer_support" | "manager" | "admin";
  message: string;
  is_internal_note?: boolean;
  created_at: string;
}

export interface SupportStaffConfig {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_email: string;
  role: "CustomerSupport" | "AdminManager" | "SuperAdmin";
  department: string;
  queries_resolved: number;
  avg_rating: number;
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
    status: "escalated",
    tier_level: "AdminManager",
    assigned_staff_id: "staff-2",
    assigned_staff_name: "Neha Gupta (Support Manager)",
    assigned_staff_role: "AdminManager",
    escalation_reason: "Requires backend tax calculation override. Customer support escalated to Manager level.",
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

  // Post chat message in ticket
  sendTicketMessage: async (
    ticketId: string, 
    message: string, 
    senderRole: "user" | "customer_support" | "manager" | "admin" = "user",
    senderName: string = "User"
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
      });
    } catch {}

    return newMsg;
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
};
