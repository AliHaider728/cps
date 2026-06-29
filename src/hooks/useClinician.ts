import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface ClinicianData {
  id?: string;
  clinician?: Record<string, any>;
  [key: string]: any;
}

export interface ClientHistoryData {
  [key: string]: any;
}

export interface CPPEData {
  [key: string]: any;
}

export const useClinician = (id: string): UseQueryResult<ClinicianData, Error> =>
  useQuery<ClinicianData, Error>({
    queryKey: QK.CLINICIAN(id),
    queryFn:  () => clinicianService.getById(id).then((r: { data: ClinicianData }) => r.data),
    enabled:  !!id,
  });

export const useUpdateClinician = (): UseMutationResult<ClinicianData, Error, { id: string; data: Partial<ClinicianData> }> => {
  const qc = useQueryClient();
  return useMutation<ClinicianData, Error, { id: string; data: Partial<ClinicianData> }>({
    mutationFn: ({ id, data }) =>
      clinicianService.update(id, data).then((r: { data: ClinicianData }) => r.data),
    onSuccess: (result, { id }) => {
      if (result?.clinician) {
        qc.setQueryData<ClinicianData>(QK.CLINICIAN(id), (existing) =>
          existing?.clinician
            ? { ...existing, clinician: { ...existing.clinician, ...result.clinician } }
            : { clinician: result.clinician }
        );
      }
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* Client history — read only, used in Tab 4 */
export const useClinicianClientHistory = (id: string): UseQueryResult<ClientHistoryData[], Error> =>
  useQuery<ClientHistoryData[], Error>({
    queryKey: QK.CLINICIAN_CLIENT_HISTORY(id),
    queryFn:  () => clinicianService.getClientHistory(id).then((r: { data: ClientHistoryData[] }) => r.data),
    enabled:  !!id,
  });

/* CPPE — read + update */
export const useClinicianCPPE = (id: string): UseQueryResult<CPPEData, Error> =>
  useQuery<CPPEData, Error>({
    queryKey: QK.CLINICIAN_CPPE(id),
    queryFn:  () => clinicianService.getCPPE(id).then((r: { data: CPPEData }) => r.data),
    enabled:  !!id,
  });

export const useUpdateClinicianCPPE = (id: string): UseMutationResult<CPPEData, Error, Partial<CPPEData>> => {
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

/* Onboarding — update + send welcome pack */
export const useUpdateOnboarding = (id: string): UseMutationResult<unknown, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      clinicianService.updateOnboarding(id, data).then((r: { data: unknown }) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) }); },
  });
};

export const useSendWelcomePack = (id: string): UseMutationResult<unknown, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: (data) =>
      clinicianService.sendWelcomePack(id, data).then((r: { data: unknown }) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) }); },
  });
};

