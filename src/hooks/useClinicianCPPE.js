/**
 * hooks/useClinicianCPPE.js — Module 3
 *
 * React Query hooks for Tab 7 — CPPE Training Status.
 * Mirrors the pattern of useClinicianSupervision.js.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

/* ─── GET ─────────────────────────────────────────────────── */
export const useClinicianCPPE = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_CPPE(id),
    queryFn:  () => clinicianService.getCPPE(id).then((r) => r.data),
    enabled:  !!id,
  });

/* ─── UPDATE ─────────────────────────────────────────────── */
export const useUpdateCPPE = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.updateCPPE(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_CPPE(id) });
      // Also refresh the main clinician record (cppeStatus is embedded)
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};