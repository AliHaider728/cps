import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import { QK } from "../lib/queryKeys";

// ── GET: current logged-in user ──────────────────────────────────────
export const useMe = () =>
  useQuery({
    queryKey: QK.ME,
    queryFn:  () => authService.getMe().then((r) => r.data),
    retry: false,
  });

// ── GET: all users (with optional role/department/isActive filter) ───
export const useAllUsers = (params = {}) =>
  useQuery({
    queryKey: [...QK.USERS, params],
    queryFn:  () => authService.getAllUsers(params).then((r) => r.data),
  });

// ── GET: single user by ID ───────────────────────────────────────────
// NEW: needed for clinician profile detail page (blueprint section 03)
export const useUser = (id) =>
  useQuery({
    queryKey: QK.USER(id),
    queryFn:  () => authService.getUserById(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── MUTATION: create user ────────────────────────────────────────────
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authService.createUser(data).then((r) => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: update user ────────────────────────────────────────────
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => authService.updateUser(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QK.USERS });
      queryClient.invalidateQueries({ queryKey: QK.USER(id) });
    },
  });
};

// ── MUTATION: delete user ────────────────────────────────────────────
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => authService.deleteUser(id).then((r) => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: GDPR anonymise user ───────────────────────────────────
export const useAnonymiseUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => authService.anonymiseUser(id).then((r) => r.data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

// ── MUTATION: change password ────────────────────────────────────────
export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ newPassword, config }) =>
      authService.changePassword(newPassword, config).then((r) => r.data),
  });