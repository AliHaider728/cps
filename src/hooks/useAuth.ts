import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { authService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface UserData {
  id?: string;
  [key: string]: any;
}

export interface UserParams {
  [key: string]: any;
}

export interface ChangePasswordParams {
  newPassword: string;
  config?: Record<string, unknown>;
}

export const useMe = (): UseQueryResult<UserData, Error> =>
  useQuery<UserData, Error>({
    queryKey: QK.ME,
    queryFn:  () => authService.getMe().then((r: { data: UserData }) => r.data),
    retry: false,
  });

export const useAllUsers = (params: UserParams = {}): UseQueryResult<UserData[], Error> =>
  useQuery<UserData[], Error>({
    placeholderData: keepPreviousData,
    queryKey: [...QK.USERS, params],
    // @ts-ignore
    queryFn:  () => authService.getAllUsers(params).then((r: { data: UserData[] }) => r.data),
  });

export const useUser = (id: string): UseQueryResult<UserData, Error> =>
  useQuery<UserData, Error>({
    queryKey: QK.USER(id),
    queryFn:  () => authService.getUserById(id).then((r: { data: UserData }) => r.data),
    enabled:  !!id,
  });

export const useCreateUser = (): UseMutationResult<UserData, Error, Partial<UserData>> => {
  const queryClient = useQueryClient();
  return useMutation<UserData, Error, Partial<UserData>>({
    mutationFn: (data) => authService.createUser(data).then((r: { data: UserData }) => r.data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: QK.USERS }); },
  });
};

export const useUpdateUser = (): UseMutationResult<UserData, Error, { id: string; data: Partial<UserData> }> => {
  const queryClient = useQueryClient();
  return useMutation<UserData, Error, { id: string; data: Partial<UserData> }>({
    mutationFn: ({ id, data }) => authService.updateUser(id, data).then((r: { data: UserData }) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QK.USERS });
      queryClient.invalidateQueries({ queryKey: QK.USER(id) });
    },
  });
};

export const useDeleteUser = (): UseMutationResult<any, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => authService.deleteUser(id).then((r: { data: any }) => r.data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: QK.USERS }); },
  });
};

export const useAnonymiseUser = (): UseMutationResult<any, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => authService.anonymiseUser(id).then((r: { data: any }) => r.data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: QK.USERS }); },
  });
};

export const useChangePassword = (): UseMutationResult<any, Error, ChangePasswordParams> =>
  useMutation<unknown, Error, ChangePasswordParams>({
    mutationFn: ({ newPassword, config }) =>
      authService.changePassword(newPassword, config).then((r: { data: any }) => r.data),
  });



