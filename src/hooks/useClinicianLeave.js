import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicianLeave = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_LEAVE(id),
    queryFn:  () => clinicianService.getLeave(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useAddLeave = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.addLeave(id, data).then((r) => r.data),
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
