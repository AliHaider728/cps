// src/hooks/usePCN.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pcnAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: all PCNs (with optional filters)
export const usePCNs = (params = {}) =>
  useQuery({
    queryKey: [...QK.PCNS, params],
    queryFn:  () => pcnAPI.getAll(params).then((r) => r.data),
  });

// ── GET: single PCN
export const usePCN = (id) =>
  useQuery({
    queryKey: QK.PCN(id),
    queryFn:  () => pcnAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── GET: PCN rollup data
export const usePCNRollup = (id) =>
  useQuery({
    queryKey: QK.PCN_ROLLUP(id),
    queryFn:  () => pcnAPI.getRollup(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── GET: PCN monthly meetings
export const usePCNMeetings = (id) =>
  useQuery({
    queryKey: QK.PCN_MEETINGS(id),
    queryFn:  () => pcnAPI.getMeetings(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── MUTATION: create PCN
export const useCreatePCN = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => pcnAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

// ── MUTATION: update PCN
export const useUpdatePCN = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => pcnAPI.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.PCNS });
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
    },
  });
};

// ── MUTATION: delete PCN
export const useDeletePCN = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => pcnAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

// ── MUTATION: update restricted clinicians
export const useUpdateRestrictedClinicians = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinicianIds }) =>
      pcnAPI.updateRestricted(id, clinicianIds).then((r) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QK.PCN(id) }),
  });
};

// ── MUTATION: upsert monthly meeting
export const useUpsertMeeting = (pcnId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => pcnAPI.upsertMeeting(pcnId, data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.PCN_MEETINGS(pcnId) }),
  });
};