import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { clearSession, setSession, updateUser } from "../slices/authSlice";
import { authService, storage } from "../services/api";
import { QK } from "../lib/queryKeys";

export const AuthProvider = ({ children }) => children;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, token, initialized } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authService.login(email, password);
      const nextSession = { token: data.token, user: data.user };
      storage.setSession(nextSession);
      dispatch(setSession(nextSession));
      queryClient.setQueryData(QK.ME, { success: true, user: data.user });
      return {
        token: data.token,
        redirectTo: data.user.redirectTo,
        mustChangePassword: data.user.mustChangePassword ?? false,
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
    queryClient.removeQueries({ queryKey: QK.ME });
  }, [dispatch, queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      storage.setSession({ token, user: data.user });
      dispatch(updateUser(data.user));
      queryClient.setQueryData(QK.ME, data);
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
