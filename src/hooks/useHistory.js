// src/hooks/useHistory.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { historyService } from "../services/api/clientManagement.service";

/* ══════════════════════════════════════════════════════════════════
   QUERY KEYS
   Inline here so we don't depend on queryKeys.js import order.
   Format: ["history", entityType, entityId]
══════════════════════════════════════════════════════════════════ */
const historyKey = (entityType, entityId) => ["history", entityType, entityId];

/* ══════════════════════════════════════════════════════════════════
   GET — contact history list
══════════════════════════════════════════════════════════════════ */
export const useHistory = (entityType, entityId, params = {}) =>
  useQuery({
    queryKey: [...historyKey(entityType, entityId), params],
    queryFn:  () =>
      historyService.get(entityType, entityId, params).then((r) => r.data),
    enabled:  !!entityType && !!entityId,
    staleTime: 30_000,
  });

/* ══════════════════════════════════════════════════════════════════
   ADD — new log entry
══════════════════════════════════════════════════════════════════ */
export const useAddHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      historyService.add(entityType, entityId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   UPDATE — edit existing log entry
══════════════════════════════════════════════════════════════════ */
export const useUpdateHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }) =>
      historyService.update(logId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   TOGGLE STAR
══════════════════════════════════════════════════════════════════ */
export const useToggleStar = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId) =>
      historyService.toggleStar(logId).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};

/* ══════════════════════════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════════════════════════ */
export const useDeleteHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId) =>
      historyService.delete(logId).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: historyKey(entityType, entityId) }),
  });
};