import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { timesheetService } from "../services/api/timesheetService";

export interface Timesheet {
  id?: string | number;
  [key: string]: any;
}

export interface TimesheetDetail {
  id?: string | number;
  [key: string]: any;
}

export interface TimesheetFilters {
  [key: string]: any;
}

export function useMyTimesheet(month: number | string, year: number | string): UseQueryResult<Timesheet[], Error> {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["my-timesheet", month, year],
    queryFn: () => timesheetService.getMyTimesheet(month, year),
    enabled: !!month && !!year,
  });
}

export function usePendingTimesheets(): UseQueryResult<Timesheet[], Error> {
  return useQuery({
    queryKey: ["timesheets", "pending"],
    queryFn: () => timesheetService.getPendingTimesheets(),
  });
}

export function useTimesheetDetail(id: string | number): UseQueryResult<TimesheetDetail, Error> {
  return useQuery({
    queryKey: ["timesheet", id],
    queryFn: () => timesheetService.getTimesheetDetail(id),
    enabled: !!id,
  });
}

export function useTimesheetHistory(filters: TimesheetFilters = {}): UseQueryResult<Timesheet[], Error> {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["timesheets", "history", filters],
    queryFn: () => timesheetService.getTimesheetHistory(filters),
  });
}

export function useUpdateTimesheetEntry(): UseMutationResult<any, Error, { entryId: string | number; data: any }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string | number; data: any }) => timesheetService.updateEntry(entryId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-timesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useSubmitTimesheet(): UseMutationResult<any, Error, string | number> & { submitHandler: any; isLoading: boolean; error: Error | null } {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (timesheetId: string | number) => timesheetService.submitTimesheet(timesheetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-timesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
  // @ts-ignore
  return { ...mutation, submitHandler: mutation.mutateAsync, isLoading: mutation.isPending, error: mutation.error };
}

export function useApproveTimesheet(): UseMutationResult<any, Error, string | number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => timesheetService.approveTimesheet(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useRejectTimesheet(): UseMutationResult<any, Error, { id: string | number; reason: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason: string }) => timesheetService.rejectTimesheet(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useAdminTimesheet(clinicianId: string | number, month: number | string, year: number | string): UseQueryResult<Timesheet[], Error> {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["admin-timesheet", clinicianId, month, year],
    queryFn: () => timesheetService.getTimesheetHistory({ clinician_id: clinicianId, month, year }),
    enabled: !!clinicianId && !!month && !!year,
  });
}



