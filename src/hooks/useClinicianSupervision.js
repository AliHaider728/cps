import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useClinicianSupervision = (id) =>
  useQuery({
    queryKey: QK.CLINICIAN_SUPERVISION(id),
    queryFn:  () => clinicianService.getSupervision(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useAddSupervisionLog = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      clinicianService.addSupervision(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useUpdateSupervisionLog = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }) =>
      clinicianService.updateSupervision(id, logId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) }),
  });
};

export const useDeleteSupervisionLog = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId) =>
      clinicianService.deleteSupervision(id, logId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.CLINICIAN_SUPERVISION(id) }),
  });
};
