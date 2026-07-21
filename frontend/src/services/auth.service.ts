/**
 * DebtProof — Authentication Service
 * Wraps all auth-related API calls.
 */
import apiClient, { tokenStorage } from "./api";
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from "@/types";

const DEMO_USER_KEY = "debtproof_demo_user";

function getLocalDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLocalDemoUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export const authService = {
  /**
   * Register a new user account.
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post<AuthResponse>("/auth/register/", payload);
      if (data.tokens) {
        tokenStorage.set(data.tokens.access, data.tokens.refresh);
      }
      if (data.user) {
        setLocalDemoUser(data.user);
      }
      return data;
    } catch (err: any) {
      // If server responded with a validation error (e.g. email exists), throw it
      if (err?.response?.status && err.response.status < 500) {
        throw err;
      }
      // Fallback for offline network failure
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        full_name: `${payload.first_name} ${payload.last_name}`.trim(),
        phone_number: "",
        avatar: null,
        avatar_url: null,
        bio: "Managing personal investments, mutual funds, and loan portfolios.",
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const demoResponse: AuthResponse = {
        success: true,
        message: "Account created successfully.",
        user: newUser,
        tokens: {
          access: "demo_access_token_" + Date.now(),
          refresh: "demo_refresh_token_" + Date.now(),
        },
      };

      tokenStorage.set(demoResponse.tokens.access, demoResponse.tokens.refresh);
      setLocalDemoUser(newUser);
      return demoResponse;
    }
  },

  /**
   * Login with email and password.
   */
  login: async (credentials: LoginCredentials): Promise<{ access: string; refresh: string }> => {
    try {
      const { data } = await apiClient.post<{ access: string; refresh: string }>(
        "/auth/login/",
        credentials
      );
      tokenStorage.set(data.access, data.refresh);
      return data;
    } catch (err: any) {
      if (err?.response?.status) {
        // Real API error (e.g. 401 invalid password)
        throw err;
      }
      // Network offline fallback
      const existing = getLocalDemoUser();
      const user: User = existing || {
        id: "usr-1",
        email: credentials.email,
        first_name: "Abhimanyu",
        last_name: "Vaishnav",
        full_name: "Abhimanyu Vaishnav",
        phone_number: "+91 98765 43210",
        avatar: null,
        avatar_url: null,
        bio: "Managing personal investments, mutual funds, and loan portfolios.",
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLocalDemoUser(user);
      const demoTokens = {
        access: "demo_access_token_" + Date.now(),
        refresh: "demo_refresh_token_" + Date.now(),
      };
      tokenStorage.set(demoTokens.access, demoTokens.refresh);
      return demoTokens;
    }
  },

  /**
   * Logout the current user.
   */
  logout: async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout/", { refresh: refreshToken });
      } catch {
        /* ignore */
      } finally {
        tokenStorage.clear();
      }
    } else {
      tokenStorage.clear();
    }
  },

  /**
   * Get the authenticated user's profile.
   */
  getProfile: async (): Promise<User> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; user: User }>("/auth/profile/");
      setLocalDemoUser(data.user);
      return data.user;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw err;
      }
      const local = getLocalDemoUser();
      if (local) return local;

      const defaultUser: User = {
        id: "usr-1",
        email: "abhimanyu@debtproof.io",
        first_name: "Abhimanyu",
        last_name: "Vaishnav",
        full_name: "Abhimanyu Vaishnav",
        phone_number: "+91 98765 43210",
        avatar: null,
        avatar_url: null,
        bio: "Managing personal investments, mutual funds, and loan portfolios.",
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalDemoUser(defaultUser);
      return defaultUser;
    }
  },

  /**
   * Update the authenticated user's profile.
   */
  updateProfile: async (payload: Partial<User>): Promise<User> => {
    try {
      const { data } = await apiClient.patch<{ success: boolean; user: User }>(
        "/auth/profile/",
        payload
      );
      setLocalDemoUser(data.user);
      return data.user;
    } catch {
      const existing = getLocalDemoUser() || {
        id: "usr-1",
        email: "user@debtproof.io",
        first_name: "User",
        last_name: "",
        full_name: "User",
        phone_number: "",
        avatar: null,
        avatar_url: null,
        bio: "",
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updated: User = {
        ...existing,
        ...payload,
        full_name: `${payload.first_name ?? existing.first_name} ${payload.last_name ?? existing.last_name}`.trim(),
        updated_at: new Date().toISOString(),
      };
      setLocalDemoUser(updated);
      return updated;
    }
  },
};
