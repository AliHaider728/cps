import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useMe = () =>
  useQuery({
    queryKey: QK.ME,
    queryFn: () => authService.getMe().then((response) => response.data),
    retry: false,
  });

export const useAllUsers = () =>
  useQuery({
    queryKey: QK.USERS,
    queryFn: () => authService.getAllUsers().then((response) => response.data),
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authService.createUser(data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => authService.updateUser(id, data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => authService.deleteUser(id).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

export const useAnonymiseUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => authService.anonymiseUser(id).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.USERS }),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ newPassword, config }) =>
      authService.changePassword(newPassword, config).then((response) => response.data),
  });
