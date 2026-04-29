/**
 * hooks/useClinicianOnboarding.js — Module 3
 *
 * React Query hooks for Tab 8 — Onboarding & IT Setup.
 * Mirrors the pattern of useClinicianSupervision.js.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

/* ─── UPDATE onboarding checklist ───────────────────────── */
export const useUpdateOnboarding = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.updateOnboarding(id, data).then((r) => r.data),
    onSuccess: () => {
      // Onboarding is embedded in the main clinician record
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* ─── SEND welcome pack ──────────────────────────────────── */
export const useSendWelcomePack = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.sendWelcomePack(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};