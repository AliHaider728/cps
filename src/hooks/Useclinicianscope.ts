import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface ScopeData {
  id?: string;
  [key: string]: any;
}

export interface RestrictedClientData {
  id?: string;
  [key: string]: any;
}

/* ─── GET scope record ──────────────────────────────────── */
export const useClinicianScope = (id: string): UseQueryResult<ScopeData, Error> =>
  useQuery<ScopeData, Error>({
    queryKey: QK.CLINICIAN_SCOPE(id),
    queryFn:  () => clinicianService.getScope(id).then((r: { data: ScopeData }) => r.data),
    enabled:  !!id,
  });

/* ─── UPDATE scope record ───────────────────────────────── */
export const useUpdateScope = (id: string): UseMutationResult<ScopeData, Error, Partial<ScopeData>> => {
  const qc = useQueryClient();
  return useMutation<ScopeData, Error, Partial<ScopeData>>({
    mutationFn: (data) =>
      clinicianService.updateScope(id, data).then((r: { data: ScopeData }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_SCOPE(id) });
      // Sync the denormalised fields on the clinician record
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* ─── GET per-client restrictions for this clinician ──── */
export const useRestrictedClients = (id: string): UseQueryResult<RestrictedClientData[], Error> =>
  useQuery<RestrictedClientData[], Error>({
    queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id),
    queryFn:  () => clinicianService.getRestrictedClients(id).then((r: { data: RestrictedClientData[] }) => r.data),
    enabled:  !!id,
  });

/* ─── ADD per-client restriction ────────────────────────── */
export const useAddRestrictedClient = (id: string): UseMutationResult<RestrictedClientData, Error, Partial<RestrictedClientData>> => {
  const qc = useQueryClient();
  return useMutation<RestrictedClientData, Error, Partial<RestrictedClientData>>({
    mutationFn: (data) =>
      clinicianService.addRestrictedClient(id, data).then((r: { data: RestrictedClientData }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

/* ─── REMOVE per-client restriction ─────────────────────── */
export const useRemoveRestrictedClient = (id: string): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (recordId) =>
      clinicianService.removeRestrictedClient(id, recordId).then((r: { data: any }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* ─── Global/system restrict + unrestrict ───────────────── */
export const useRestrictClinician = (id: string): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (reason) =>
      clinicianService.restrict(id, reason).then((r: { data: any }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

export const useUnrestrictClinician = (id: string): UseMutationResult<any, Error, void> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () =>
      clinicianService.unrestrict(id).then((r: { data: any }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};


