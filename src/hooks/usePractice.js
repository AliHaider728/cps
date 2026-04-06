// src/hooks/usePractice.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: all practices (with optional filters e.g. { pcn: id })
export const usePractices = (params = {}) =>
  useQuery({
    queryKey: [...QK.PRACTICES, params],
    queryFn:  () => practiceAPI.getAll(params).then((r) => r.data),
  });

// ── GET: single practice
export const usePractice = (id) =>
  useQuery({
    queryKey: QK.PRACTICE(id),
    queryFn:  () => practiceAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── MUTATION: create practice
export const useCreatePractice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => practiceAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.PRACTICES }),
  });
};

// ── MUTATION: update practice
export const useUpdatePractice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => practiceAPI.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.PRACTICES });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

// ── MUTATION: delete practice
export const useDeletePractice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => practiceAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.PRACTICES }),
  });
};

// ── MUTATION: update restricted clinicians (practice level)
export const useUpdateRestrictedPractice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinicianIds }) =>
      practiceAPI.updateRestricted(id, clinicianIds).then((r) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QK.PRACTICE(id) }),
  });
};

// ── MUTATION: request system access
export const useRequestSystemAccess = () =>
  useMutation({
    mutationFn: ({ entityType, entityId, data }) =>
      practiceAPI.requestSystemAccess(entityType, entityId, data).then((r) => r.data),
  });