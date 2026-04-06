// src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: logged-in user info
export const useMe = () =>
  useQuery({
    queryKey: QK.ME,
    queryFn:  () => authAPI.getMe().then((r) => r.data),
  });

// ── GET: all users (admin)
export const useAllUsers = () =>
  useQuery({
    queryKey: QK.USERS,
    queryFn:  () => authAPI.getAllUsers().then((r) => r.data),
  });

// ── MUTATION: create user
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => authAPI.createUser(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: update user
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => authAPI.updateUser(id, data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: delete user
export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => authAPI.deleteUser(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: anonymise user (GDPR)
export const useAnonymiseUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => authAPI.anonymiseUser(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: change password
export const useChangePassword = () =>
  useMutation({
    mutationFn: (newPassword) =>
      authAPI.changePassword(newPassword).then((r) => r.data),
  });