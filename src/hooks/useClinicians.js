import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

/* ── List + Create + Delete ─────────────────────────────── */

export const useClinicians = (params = {}) =>
  useQuery({
    queryKey: [...QK.CLINICIANS, params],
    queryFn:  () => clinicianService.getAll(params).then((r) => r.data),
  });

export const useCreateClinician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => clinicianService.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.CLINICIANS }),
  });
};

export const useDeleteClinician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => clinicianService.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.CLINICIANS }),
  });
};

/* ── Restrict / Unrestrict ──────────────────────────────── */

export const useRestrictClinician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      clinicianService.restrict(id, reason).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useUnrestrictClinician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => clinicianService.unrestrict(id).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};
