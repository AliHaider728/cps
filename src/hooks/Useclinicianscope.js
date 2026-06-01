/**
 * hooks/useClinicianScope.js — Module 3
 *
 * React Query hooks for Tab 9 — Scope of Practice.
 * Covers workstreams, systems in use, shadowing flag, and
 * per-client restriction management.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

/* ─── GET scope record ──────────────────────────────────── */
export const useClinicianScope = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_SCOPE(id),
    queryFn:  () => clinicianService.getScope(id).then((r) => r.data),
    enabled:  !!id,
  });

/* ─── UPDATE scope record ───────────────────────────────── */
export const useUpdateScope = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.updateScope(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_SCOPE(id) });
      // Sync the denormalised fields on the clinician record
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* ─── GET per-client restrictions for this clinician ──── */
export const useRestrictedClients = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id),
    queryFn:  () => clinicianService.getRestrictedClients(id).then((r) => r.data),
    enabled:  !!id,
  });

/* ─── ADD per-client restriction ────────────────────────── */
export const useAddRestrictedClient = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.addRestrictedClient(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

/* ─── REMOVE per-client restriction ─────────────────────── */
export const useRemoveRestrictedClient = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId) =>
      clinicianService.removeRestrictedClient(id, recordId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_RESTRICTED_CLIENTS(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* ─── Global/system restrict + unrestrict ───────────────── */
export const useRestrictClinician = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason) =>
      clinicianService.restrict(id, reason).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

export const useUnrestrictClinician = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      clinicianService.unrestrict(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};