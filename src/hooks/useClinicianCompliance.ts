import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface ComplianceData {
  [key: string]: any;
}

export interface ComplianceGroupData {
  [key: string]: any;
}

export const useClinicianCompliance = (id: string): UseQueryResult<ComplianceData[], Error> =>
  useQuery<ComplianceData[], Error>({
    queryKey: QK.CLINICIAN_COMPLIANCE(id),
    queryFn:  () => clinicianService.getCompliance(id).then((r: { data: ComplianceData[] }) => r.data),
    enabled:  !!id,
  });

export const useUpsertClinicianDoc = (id: string): UseMutationResult<unknown, Error, { docId?: string; data: unknown }> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { docId?: string; data: unknown }>({
    mutationFn: ({ docId, data }) =>
      // @ts-ignore
      clinicianService.upsertComplianceDoc(id, docId || "new", data).then((r: { data: unknown }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

export const useApproveClinicianDoc = (id: string): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (docId) =>
      clinicianService.approveComplianceDoc(id, docId).then((r: { data: unknown }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

export const useRejectClinicianDoc = (id: string): UseMutationResult<unknown, Error, { docId: string; reason: string }> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { docId: string; reason: string }>({
    mutationFn: ({ docId, reason }) =>
      clinicianService.rejectComplianceDoc(id, docId, reason).then((r: { data: unknown }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

export const useClinicianComplianceGroups = (id: string): UseQueryResult<ComplianceGroupData[], Error> =>
  useQuery<ComplianceGroupData[], Error>({
    queryKey: ["clinician", id, "compliance-groups"],
    queryFn:  () =>
      clinicianService.getClinicianComplianceGroups(id).then((r: { data: ComplianceGroupData[] }) => r.data),
    enabled: !!id,
  });

export const useAssignComplianceGroups = (id: string): UseMutationResult<unknown, Error, { groupIds: string[] }> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { groupIds: string[] }>({
    mutationFn: ({ groupIds }) =>
      clinicianService.assignComplianceGroups(id, groupIds).then((r: { data: unknown }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
    },
  });
};


