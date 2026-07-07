import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicianSupervision = (id: string): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.CLINICIAN_SUPERVISION(id),
    queryFn:  () => clinicianService.getSupervision(id).then((r: { data: any }) => r.data),
    enabled:  !!id,
  });

export const useAddSupervisionLog = (id: string): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      clinicianService.addSupervision(id, data).then((r: { data: any }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useUpdateSupervisionLog = (id: string): UseMutationResult<any, Error, { logId: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }: { logId: string; data: Record<string, unknown> }) =>
      clinicianService.updateSupervision(id, logId, data).then((r: { data: any }) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) }),
  });
};

export const useDeleteSupervisionLog = (id: string): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      clinicianService.deleteSupervision(id, logId).then((r: { data: any }) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) }),
  });
};


