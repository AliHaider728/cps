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
