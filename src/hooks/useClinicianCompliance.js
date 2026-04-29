import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicianCompliance = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_COMPLIANCE(id),
    queryFn:  () => clinicianService.getCompliance(id).then((r) => r.data),
    enabled:  !!id,
  });

/**
 * useUpsertClinicianDoc
 * Accepts either FormData (with file) or a plain object.
 * Mutation key: { docId, data }   (docId may be "new" or omitted for new doc)
 */
export const useUpsertClinicianDoc = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, data }) =>
      clinicianService.upsertComplianceDoc(id, docId || "new", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) }),
  });
};

export const useApproveClinicianDoc = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId) =>
      clinicianService.approveComplianceDoc(id, docId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) }),
  });
};

export const useRejectClinicianDoc = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, reason }) =>
      clinicianService.rejectComplianceDoc(id, docId, reason).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) }),
  });
};
