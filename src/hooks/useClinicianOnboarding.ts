import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useUpdateOnboarding = (id: string): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      clinicianService.updateOnboarding(id, data).then((r: { data: any }) => r.data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useSendWelcomePack = (id: string): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      clinicianService.sendWelcomePack(id, data).then((r: { data: any }) => r.data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};


