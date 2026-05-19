import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timesheetService } from "../services/api/timesheetService";

export function useMyTimesheet(month, year) {
  return useQuery({
    queryKey: ["my-timesheet", month, year],
    queryFn: () => timesheetService.getMyTimesheet(month, year),
    enabled: !!month && !!year,
  });
}

export function usePendingTimesheets() {
  return useQuery({
    queryKey: ["timesheets", "pending"],
    queryFn: () => timesheetService.getPendingTimesheets(),
  });
}

export function useTimesheetDetail(id) {
  return useQuery({
    queryKey: ["timesheet", id],
    queryFn: () => timesheetService.getTimesheetDetail(id),
    enabled: !!id,
  });
}

export function useTimesheetHistory(filters = {}) {
  return useQuery({
    queryKey: ["timesheets", "history", filters],
    queryFn: () => timesheetService.getTimesheetHistory(filters),
  });
}

export function useUpdateTimesheetEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }) => timesheetService.updateEntry(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-timesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (timesheetId) => timesheetService.submitTimesheet(timesheetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-timesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
  return { submitHandler: mutation.mutateAsync, loading: mutation.isPending, error: mutation.error, ...mutation };
}

export function useApproveTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => timesheetService.approveTimesheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useRejectTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => timesheetService.rejectTimesheet(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useAdminTimesheet(clinicianId, month, year) {
  return useQuery({
    queryKey: ["admin-timesheet", clinicianId, month, year],
    queryFn: () => timesheetService.getTimesheetHistory({ clinician_id: clinicianId, month, year }),
    enabled: !!clinicianId && !!month && !!year,
  });
}
