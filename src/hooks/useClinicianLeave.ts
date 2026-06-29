import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { clinicianService } from "../services/api";
import { QK } from "../lib/queryKeys";

export interface LeaveData {
  [key: string]: any;
}

export const useClinicianLeave = (id?: string | null): UseQueryResult<LeaveData[], Error> =>
  useQuery<LeaveData[], Error>({
    queryKey: QK.CLINICIAN_LEAVE(id || "me"),
    queryFn:  () =>
      id
        ? clinicianService.getLeave(id).then((r: { data: LeaveData[] }) => r.data)
        : clinicianService.getMyLeave().then((r: { data: LeaveData[] }) => r.data),
    enabled: id !== null,
    retry: 1,
  });

export const useAddLeave = (id: string): UseMutationResult<LeaveData, Error, Partial<LeaveData>> => {
  const qc = useQueryClient();
  return useMutation<LeaveData, Error, Partial<LeaveData>>({
    mutationFn: (data) => {
      if (!id) throw new Error("Clinician profile not linked");
      return clinicianService.addLeave(id, data).then((r: { data: LeaveData }) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });
};

export const useUpdateLeave = (id: string): UseMutationResult<LeaveData, Error, { entryId: string; data: Partial<LeaveData> }> => {
  const qc = useQueryClient();
  return useMutation<LeaveData, Error, { entryId: string; data: Partial<LeaveData> }>({
    mutationFn: ({ entryId, data }) =>
      clinicianService.updateLeave(id, entryId, data).then((r: { data: LeaveData }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

export const useDeleteLeave = (id: string): UseMutationResult<unknown, Error, string> => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (entryId) =>
      clinicianService.deleteLeave(id, entryId).then((r: { data: unknown }) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_LEAVE(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });
};

