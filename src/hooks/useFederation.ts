import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { federationAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

export const useFederations = (icbId?: string): UseQueryResult<unknown, Error> =>
  useQuery({
    queryKey: icbId ? QK.FEDERATIONS_BY_ICB(icbId) : QK.FEDERATIONS,
    queryFn:  () => federationAPI.getAll(icbId).then((r: { data: unknown }) => r.data),
  });

export const useCreateFederation = (): UseMutationResult<unknown, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => federationAPI.create(data).then((r: { data: unknown }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};

export const useUpdateFederation = (): UseMutationResult<unknown, Error, { id: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => federationAPI.update(id, data).then((r: { data: unknown }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};

export const useDeleteFederation = (): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => federationAPI.delete(id).then((r: { data: unknown }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};

