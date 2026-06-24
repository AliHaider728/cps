import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pcnService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const usePCNs = (params = {}) =>
  useQuery({
    queryKey: [...QK.PCNS, params],
    queryFn: () => pcnService.getAll(params).then((response) => response.data),
  });

export const usePCN = (id) =>
  useQuery({
    queryKey: QK.PCN(id),
    queryFn: () => pcnService.getById(id).then((response) => response.data),
    enabled: !!id,
  }); 

export const usePCNRollup = (id) =>
  useQuery({
    queryKey: QK.PCN_ROLLUP(id),
    queryFn: () => pcnService.getRollup(id).then((response) => response.data),
    enabled: !!id,
  });

export const usePCNMeetings = (id) =>
  useQuery({
    queryKey: QK.PCN_MEETINGS(id),
    queryFn: () => pcnService.getMeetings(id).then((response) => response.data),
    enabled: !!id,
  });

/* ══════════════════════════════════════════════════════════════════
   ✅ NEW — Rate & Contract History hooks
══════════════════════════════════════════════════════════════════ */

// Summary list of ALL clients with current rate/dates + change count.
// Powers the main RateHistoryPage list.
export const usePCNRateSummary = () =>
  useQuery({
    queryKey: QK.PCN_RATE_SUMMARY,
    queryFn: () => pcnService.getRateSummary().then((response) => response.data),
  });

// Full chronological rate/contract-date history for ONE client.
// `enabled` lets you lazy-load it only when a row is expanded.
export const usePCNRateHistory = (id, enabled = true) =>
  useQuery({
    queryKey: QK.PCN_RATE_HISTORY(id),
    queryFn: () => pcnService.getRateHistory(id).then((response) => response.data),
    enabled: !!id && enabled,
  });

export const useCreatePCN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => pcnService.create(data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

export const useUpdatePCN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => pcnService.update(id, data).then((response) => response.data),
    onSuccess: (result, { id }) => {
      if (result?.pcn) {
        queryClient.setQueryData(QK.PCN(id), (existing) => (
          existing?.pcn
            ? { ...existing, pcn: { ...existing.pcn, ...result.pcn } }
            : { pcn: result.pcn }
        ));
      }

      queryClient.invalidateQueries({ queryKey: QK.PCNS });
      queryClient.invalidateQueries({ queryKey: QK.PCN(id) });
      queryClient.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS("PCN", id) });
      // ✅ NEW — keep rate history fresh after a PCN update (rate/date may have changed)
      queryClient.invalidateQueries({ queryKey: QK.PCN_RATE_SUMMARY });
      queryClient.invalidateQueries({ queryKey: QK.PCN_RATE_HISTORY(id) });
    },
  });
};

export const useDeletePCN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => pcnService.delete(id).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

export const useUpdateRestrictedClinicians = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinicianIds }) =>
      pcnService.updateRestricted(id, clinicianIds).then((response) => response.data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: QK.PCN(id) }),
  });
};

export const useUpsertMeeting = (pcnId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => pcnService.upsertMeeting(pcnId, data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCN_MEETINGS(pcnId) }),
  });
};