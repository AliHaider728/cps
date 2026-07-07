import { useCallback, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { clearSession, setSession, updateUser } from "../slices/authSlice";
import { authService, storage } from "../services/api";
import { QK } from "../lib/queryKeys";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => <>{children}</>;

export interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<{
    token: string;
    redirectTo?: string;
    mustChangePassword?: boolean;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<any>;
}

export const useAuth = (): AuthContextType => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, token, initialized } = useAppSelector((state: any) => state.auth);

  const login = useCallback(
    async (email: string, password: string, recaptchaToken?: string): Promise<{ token: string; redirectTo?: string; mustChangePassword?: boolean }> => {
      const { data } = await authService.login(email, password, recaptchaToken);
      const nextSession = { token: data.token, user: data.user };
      storage.setSession(nextSession);
      dispatch(setSession(nextSession));
      queryClient.setQueryData(QK.ME as any, { success: true, user: data.user });
      return {
        token: data.token as string,
        redirectTo: data.user.redirectTo as string | undefined,
        mustChangePassword: !!(data.user.mustChangePassword),
      };
    },
    [dispatch, queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {}
    storage.clearSession();
    dispatch(clearSession());
    queryClient.removeQueries({ queryKey: QK.ME as any });
  }, [dispatch, queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe() as any;
      storage.setSession({ token: token || "", user: data.user });
      dispatch(updateUser(data.user));
      queryClient.setQueryData(QK.ME as any, data);
      return data.user;
    } catch (error) {
      storage.clearSession();
      dispatch(clearSession());
      throw error;
    }
  }, [dispatch, queryClient, token]);

  return {
    user,
    token,
    loading: !initialized,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };
};


