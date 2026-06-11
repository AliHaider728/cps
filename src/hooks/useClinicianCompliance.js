import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

/* ─── Compliance docs (legacy flat list) ─────────────────────────── */
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

export const useApproveClinicianDoc = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId) =>
      clinicianService.approveComplianceDoc(id, docId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

export const useRejectClinicianDoc = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, reason }) =>
      clinicianService.rejectComplianceDoc(id, docId, reason).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
    },
  });
};

/* ─── Compliance Groups (NEW) ────────────────────────────────────────
   useClinicianComplianceGroups  — fetch assigned groups with doc status
   useAssignComplianceGroups     — assign groups to clinician
─────────────────────────────────────────────────────────────────── */

/**
 * useClinicianComplianceGroups
 * Fetches assigned DocumentGroups for a clinician, each with per-doc
 * upload status (missing / uploaded / approved / rejected / expired).
 */
export const useClinicianComplianceGroups = (id) =>
  useQuery({
    queryKey: ["clinician", id, "compliance-groups"],
    queryFn:  () =>
      clinicianService.getClinicianComplianceGroups(id).then((r) => r.data),
    enabled: !!id,
  });

/**
 * useAssignComplianceGroups
 * Replaces the clinician's complianceGroups array with the provided groupIds.
 * Body: { groupIds: string[] }
 */
export const useAssignComplianceGroups = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupIds }) =>
      clinicianService.assignComplianceGroups(id, groupIds).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinician", id, "compliance-groups"] });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_COMPLIANCE(id) });
    },
  });
};