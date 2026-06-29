import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { pcnService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface PCN {
  id?: string | number;
  [key: string]: any;
}

export interface PCNParams {
  [key: string]: any;
}

export interface PCNRateSummary {
  [key: string]: any;
}

export interface PCNRateHistory {
  [key: string]: any;
}

export interface PCNMeeting {
  id?: string | number;
  [key: string]: any;
}

export const usePCNs = (params: PCNParams = {}): UseQueryResult<PCN[], Error> =>
  useQuery({
    queryKey: [...QK.PCNS, params],
    queryFn: () => pcnService.getAll(params).then((response: { data: PCN[] }) => response.data),
  });

export const usePCN = (id: string | number): UseQueryResult<PCN, Error> =>
  useQuery({
    queryKey: QK.PCN(id),
    queryFn: () => pcnService.getById(id).then((response: { data: PCN }) => response.data),
    enabled: !!id,
  }); 

export const usePCNRollup = (id: string | number): UseQueryResult<unknown, Error> =>
  useQuery({
    queryKey: QK.PCN_ROLLUP(id),
    queryFn: () => pcnService.getRollup(id).then((response: { data: unknown }) => response.data),
    enabled: !!id,
  });

export const usePCNMeetings = (id: string | number): UseQueryResult<PCNMeeting[], Error> =>
  useQuery({
    queryKey: QK.PCN_MEETINGS(id),
    queryFn: () => pcnService.getMeetings(id).then((response: { data: PCNMeeting[] }) => response.data),
    enabled: !!id,
  });

export const usePCNRateSummary = (): UseQueryResult<PCNRateSummary[], Error> =>
  useQuery({
    queryKey: QK.PCN_RATE_SUMMARY,
    queryFn: () => pcnService.getRateSummary().then((response: { data: PCNRateSummary[] }) => response.data),
  });

export const usePCNRateHistory = (id: string | number, enabled: boolean = true): UseQueryResult<PCNRateHistory[], Error> =>
  useQuery({
    queryKey: QK.PCN_RATE_HISTORY(id),
    queryFn: () => pcnService.getRateHistory(id).then((response: { data: PCNRateHistory[] }) => response.data),
    enabled: !!id && enabled,
  });

export const useCreatePCN = (): UseMutationResult<PCN, Error, Partial<PCN>> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PCN>) => pcnService.create(data).then((response: { data: PCN }) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

export const useUpdatePCN = (): UseMutationResult<{ pcn: PCN }, Error, { id: string | number; data: Partial<PCN> }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<PCN> }) => pcnService.update(id, data).then((response: { data: { pcn: PCN } }) => response.data),
    onSuccess: (result, { id }) => {
      if (result?.pcn) {
        queryClient.setQueryData(QK.PCN(id), (existing: { pcn: PCN } | undefined) => (
          existing?.pcn
            ? { ...existing, pcn: { ...existing.pcn, ...result.pcn } }
            : { pcn: result.pcn }
        ));
      }

      queryClient.invalidateQueries({ queryKey: QK.PCNS });
      queryClient.invalidateQueries({ queryKey: QK.PCN(id) });
      queryClient.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS("PCN", id) });
      queryClient.invalidateQueries({ queryKey: QK.PCN_RATE_SUMMARY });
      queryClient.invalidateQueries({ queryKey: QK.PCN_RATE_HISTORY(id) });
    },
  });
};

export const useDeletePCN = (): UseMutationResult<void, Error, string | number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => pcnService.delete(id).then((response: { data: void }) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCNS }),
  });
};

export const useUpdateRestrictedClinicians = (): UseMutationResult<unknown, Error, { id: string | number; clinicianIds: (string | number)[] }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinicianIds }: { id: string | number; clinicianIds: (string | number)[] }) =>
      // @ts-ignore
      pcnService.updateRestricted(id, clinicianIds).then((response: { data: unknown }) => response.data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: QK.PCN(id) }),
  });
};

export const useUpsertMeeting = (pcnId: string | number): UseMutationResult<PCNMeeting, Error, Partial<PCNMeeting>> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PCNMeeting>) => pcnService.upsertMeeting(pcnId, data).then((response: { data: PCNMeeting }) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.PCN_MEETINGS(pcnId) }),
  });
};


