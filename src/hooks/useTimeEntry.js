import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

const BASE = "/time-entries";
const QK = {
  active: ["time-entries", "active"],
  list: (params) => ["time-entries", "list", params],
  adminSummary: ["time-entries", "admin-summary"],
};

export const useActiveTimeEntry = () =>
  useQuery({
    queryKey: QK.active,
    queryFn: () => apiClient.get(`${BASE}/active`).then((r) => r.data?.data ?? null),
    refetchInterval: 30_000,
    retry: false,
  });

export const useTimeEntries = (params = {}) =>
  useQuery({
    queryKey: QK.list(params),
    queryFn: () =>
      apiClient
        .get(BASE, { params })
        .then((r) => {
          const d = r.data?.data;
          return Array.isArray(d) ? d : (d?.entries ?? []);
        }),
    retry: false,
  });

export const useClockIn = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body = {}) =>
      apiClient.post(`${BASE}/clock-in`, body).then((r) => r.data?.data),
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: QK.active });
      qc.invalidateQueries({ queryKey: ["time-entries", "list"] });
      options.onSuccess?.(data, vars, ctx);
    },
    onError: options.onError,
  });
};

export const useTimeEntryAdminSummary = (options = {}) =>
  useQuery({
    queryKey: QK.adminSummary,
    queryFn: () => apiClient.get(`${BASE}/admin/summary`).then((r) => r.data?.data ?? {}),
    retry: false,
    ...options,
  });

export const useClockOut = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post(`${BASE}/clock-out`).then((r) => r.data?.data),
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: QK.active });
      qc.invalidateQueries({ queryKey: ["time-entries", "list"] });
      options.onSuccess?.(data, vars, ctx);
    },
    onError: options.onError,
  });
};