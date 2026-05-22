import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicianLeave = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_LEAVE(id || "me"),
    queryFn:  () =>
      id
        ? clinicianService.getLeave(id).then((r) => r.data)
        : clinicianService.getMyLeave().then((r) => r.data),
    enabled: id !== null,
    retry: 1,
  });

export const useAddLeave = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      if (!id) throw new Error("Clinician profile not linked");
      return clinicianService.addLeave(id, data).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

export const useUpdateLeave = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }) =>
      clinicianService.updateLeave(id, entryId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useDeleteLeave = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) =>
      clinicianService.deleteLeave(id, entryId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};
