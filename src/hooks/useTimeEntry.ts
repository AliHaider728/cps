import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

const BASE = "/time-entries";
const QK = {
  active: ["time-entries", "active"],
  list: (params: any) => ["time-entries", "list", params],
  adminSummary: ["time-entries", "admin-summary"],
};

export interface TimeEntry {
  id?: string | number;
  [key: string]: any;
}

export interface TimeEntryParams {
  [key: string]: any;
}

export interface TimeEntryAdminSummary {
  [key: string]: any;
}

export const useActiveTimeEntry = (): UseQueryResult<TimeEntry | null, Error> =>
  useQuery({
    queryKey: QK.active,
    queryFn: () => apiClient.get(`${BASE}/active`).then((r: any) => r.data?.data ?? null),
    refetchInterval: 30_000,
    retry: false,
  });

export const useTimeEntries = (params: TimeEntryParams = {}): UseQueryResult<TimeEntry[], Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: QK.list(params),
    queryFn: () =>
      apiClient
        .get(BASE, { params })
        .then((r: any) => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : (d?.entries ?? []);
        }),
    retry: false,
  });

export const useClockIn = (options: any = {}): UseMutationResult<TimeEntry, Error, any> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any = {}) =>
      apiClient.post(`${BASE}/clock-in`, body).then((r: any) => r.data?.data),
    onSuccess: (data: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: QK.active });
      qc.invalidateQueries({ queryKey: ["time-entries", "list"] });
      options.onSuccess?.(data, vars, ctx);
    },
    onError: options.onError,
  });
};

export const useTimeEntryAdminSummary = (options: any = {}): UseQueryResult<TimeEntryAdminSummary, Error> =>
  // @ts-ignore
  useQuery({
    queryKey: QK.adminSummary,
    queryFn: () => apiClient.get(`${BASE}/admin/summary`).then((r: any) => r.data?.data ?? {}),
    retry: false,
    ...options,
  });

export const useClockOut = (options: any = {}): UseMutationResult<TimeEntry, Error, void> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post(`${BASE}/clock-out`).then((r: any) => r.data?.data),
    onSuccess: (data: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: QK.active });
      qc.invalidateQueries({ queryKey: ["time-entries", "list"] });
      options.onSuccess?.(data, vars, ctx);
    },
    onError: options.onError,
  });
};



