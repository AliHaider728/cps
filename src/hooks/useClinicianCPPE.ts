import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface CPPEData {
  [key: string]: any;
}

export const useClinicianCPPE = (id: string): UseQueryResult<CPPEData, Error> =>
  useQuery<CPPEData, Error>({
    queryKey: QK.CLINICIAN_CPPE(id),
    queryFn:  () => clinicianService.getCPPE(id).then((r: { data: CPPEData }) => r.data),
    enabled:  !!id,
  });

export const useUpdateCPPE = (id: string): UseMutationResult<CPPEData, Error, Partial<CPPEData>> => {
  const qc = useQueryClient();
  return useMutation<CPPEData, Error, Partial<CPPEData>>({
    mutationFn: (data) =>
      clinicianService.updateCPPE(id, data).then((r: { data: CPPEData }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_CPPE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

