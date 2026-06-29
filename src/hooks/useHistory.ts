// src/hooks/useHistory.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { historyService } from "../services/api/clientManagement.service";

/* ══════════════════════════════════════════════════════════════════
   QUERY KEYS
   Inline here so we don't depend on queryKeys.js import order.
   Format: ["history", entityType, entityId]
══════════════════════════════════════════════════════════════════ */
const historyKey = (entityType: string, entityId: string): [string, string, string] => ["history", entityType, entityId];

/* ══════════════════════════════════════════════════════════════════
   GET — contact history list
══════════════════════════════════════════════════════════════════ */
export const useHistory = (entityType: string, entityId: string, params: Record<string, unknown> = {}): UseQueryResult<unknown, Error> =>
  useQuery({
    queryKey: [...historyKey(entityType, entityId), params],
    queryFn:  () =>
      historyService.get(entityType, entityId, params).then((r: { data: unknown }) => r.data),
    enabled:  !!entityType && !!entityId,
    staleTime: 30_000,
  });

/* ══════════════════════════════════════════════════════════════════
   ADD — new log entry
══════════════════════════════════════════════════════════════════ */
export const useAddHistory = (entityType: string, entityId: string): UseMutationResult<unknown, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      historyService.add(entityType, entityId, data).then((r: { data: unknown }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   UPDATE — edit existing log entry
══════════════════════════════════════════════════════════════════ */
export const useUpdateHistory = (entityType: string, entityId: string): UseMutationResult<unknown, Error, { logId: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }: { logId: string; data: Record<string, unknown> }) =>
      historyService.update(logId, data).then((r: { data: unknown }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   TOGGLE STAR
══════════════════════════════════════════════════════════════════ */
export const useToggleStar = (entityType: string, entityId: string): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      historyService.toggleStar(logId).then((r: { data: unknown }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════════════════════════ */
export const useDeleteHistory = (entityType: string, entityId: string): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      historyService.delete(logId).then((r: { data: unknown }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

