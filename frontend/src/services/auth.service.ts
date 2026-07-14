/**
 * DebtProof — Authentication Service
 * Wraps all auth-related API calls.
 */
import apiClient, { tokenStorage } from "./api";
import type { AuthResponse, LoginCredentials, RegisterPayload, User } from "@/types";

export const authService = {
  /**
   * Register a new user account.
   * Returns the user profile and JWT tokens.
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/register/", payload);
    if (data.tokens) {
      tokenStorage.set(data.tokens.access, data.tokens.refresh);
    }
    return data;
  },

  /**
   * Login with email and password.
   * Returns JWT access + refresh tokens.
   */
  login: async (credentials: LoginCredentials): Promise<{ access: string; refresh: string }> => {
    const { data } = await apiClient.post<{ access: string; refresh: string }>(
      "/auth/login/",
      credentials
    );
    tokenStorage.set(data.access, data.refresh);
    return data;
  },

  /**
   * Logout the current user by blacklisting the refresh token.
   */
  logout: async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout/", { refresh: refreshToken });
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
    const { data } = await apiClient.get<{ success: boolean; user: User }>("/auth/profile/");
    return data.user;
  },

  /**
   * Update the authenticated user's profile.
   */
  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<{ success: boolean; user: User }>(
      "/auth/profile/",
      payload
    );
    return data.user;
  },
};
