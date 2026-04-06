// src/hooks/useHistory.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { historyAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: contact history for any entity
export const useHistory = (entityType, entityId, params = {}) =>
  useQuery({
    queryKey: [...QK.HISTORY(entityType, entityId), params],
    queryFn:  () =>
      historyAPI.get(entityType, entityId, params).then((r) => r.data),
    enabled: !!entityType && !!entityId,
  });

// ── MUTATION: add history log
export const useAddHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      historyAPI.add(entityType, entityId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.HISTORY(entityType, entityId) }),
  });
};

// ── MUTATION: update history log
export const useUpdateHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }) =>
      historyAPI.update(logId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.HISTORY(entityType, entityId) }),
  });
};

// ── MUTATION: toggle starred log
export const useToggleStar = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId) => historyAPI.toggleStar(logId).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.HISTORY(entityType, entityId) }),
  });
};

// ── MUTATION: delete history log
export const useDeleteHistory = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId) => historyAPI.delete(logId).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.HISTORY(entityType, entityId) }),
  });
};