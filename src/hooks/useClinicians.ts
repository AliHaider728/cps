import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicians = (params: Record<string, unknown> = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.CLINICIANS, params],
    queryFn:  () => clinicianService.getAll(params).then((r: { data: any }) => r.data),
  });

export const useCreateClinician = (): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => clinicianService.create(data).then((r: { data: any }) => r.data),
    onSuccess: (result: unknown) => {
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      if ((result as Record<string, unknown>)?.userCreated) {
        qc.invalidateQueries({ queryKey: QK.USERS });
      }
    },
  });
};

export const useDeleteClinician = (): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicianService.delete(id).then((r: { data: any }) => r.data),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: QK.CLINICIANS }),
  });
};

export const useRestrictClinician = (): UseMutationResult<any, Error, { id: string; reason: string }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      clinicianService.restrict(id, reason).then((r: { data: any }) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useUnrestrictClinician = (): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicianService.unrestrict(id).then((r: { data: any }) => r.data),
    onSuccess: (_, id: string) => {
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};


