import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinician = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN(id),
    queryFn:  () => clinicianService.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useUpdateClinician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      clinicianService.update(id, data).then((r) => r.data),
    onSuccess: (result, { id }) => {
      if (result?.clinician) {
        qc.setQueryData(QK.CLINICIAN(id), (existing) =>
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
export const useClinicianClientHistory = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_CLIENT_HISTORY(id),
    queryFn:  () => clinicianService.getClientHistory(id).then((r) => r.data),
    enabled:  !!id,
  });

/* CPPE — read + update */
export const useClinicianCPPE = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_CPPE(id),
    queryFn:  () => clinicianService.getCPPE(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useUpdateClinicianCPPE = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.updateCPPE(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_CPPE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

/* Onboarding — update + send welcome pack */
export const useUpdateOnboarding = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.updateOnboarding(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) }),
  });
};

export const useSendWelcomePack = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.sendWelcomePack(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) }),
  });
};
