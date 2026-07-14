/**
 * DebtProof — useAuth Hook
 * Manages authentication state throughout the application.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/api";
import type { User, LoginCredentials, RegisterPayload } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Attempt to restore session on mount
  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const token = tokenStorage.getAccess();
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user = await authService.getProfile();
        setState({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch {
        tokenStorage.clear();
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.login(credentials);
      const user = await authService.getProfile();
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.register(payload);
      setState({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
    } finally {
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  }, []);

  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...state, login, register, logout, clearError };
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
    return axiosErr.response?.data?.error?.message ?? "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
