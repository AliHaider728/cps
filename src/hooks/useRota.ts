import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { rotaService } from "../services/api/rotaService";
import { QK } from "../lib/queryKeys";

/* ─── Query Key Helpers ──────────────────────────────────────────────────── */
const keyRotaList = (params: any) => (QK.ROTA_LIST ? QK.ROTA_LIST(params) : ["rota", "list", params]);
const keyRota = (id: string | number) => (QK.ROTA ? QK.ROTA(id) : ["rota", "shift", id]);
const keyCompliance = (id: string | number) => ["rota", "compliance", id];
const keyRestricted = (clinicianId: string | number, practiceId: string | number) => ["rota", "restricted", clinicianId, practiceId];
const unwrap = (response: any) => response.data?.data ?? response.data;

export interface RotaParams {
  month?: number | string;
  year?: number | string;
  [key: string]: any;
}

export interface RotaShift {
  id?: string | number;
  [key: string]: any;
}

export interface TimesheetEntry {
  id?: string | number;
  [key: string]: any;
}

/* ─── Queries ────────────────────────────────────────────────────────────── */

export const useRotaList = (params: RotaParams = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: keyRotaList(params),
    queryFn: () => {
      const { month, year, ...rest } = params || {};
      // @ts-ignore
      return rotaService.getRotaGrid(month, year, rest).then((r: any) => r.data);
    },
  });

export const useMonthlyRota = (month: number | string, year: number | string): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["rota", "monthly", month, year],
    queryFn: () => rotaService.getMonthlyRota(month, year).then(unwrap),
    enabled: !!month && !!year,
  });

export const useRotaGaps = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: ["rota", "gaps"],
    queryFn: () => rotaService.getRotaGaps().then(unwrap),
  });

export const useMyRotaAll = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: ["myRota", "all"],
    queryFn: () => rotaService.getMyRotaAll().then(unwrap),
    staleTime: 1000 * 60 * 2,
  });

export const useMyRota = (month?: number | string | null, year?: number | string | null, options: any = {}): UseQueryResult<any, Error> => {
  const scopeAll = options.scope === "all" || month == null || year == null;
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: scopeAll ? ["myRota", "all"] : ["myRota", month, year],
    queryFn: () =>
      scopeAll
        ? rotaService.getMyRotaAll().then(unwrap)
        : rotaService.getMyRota({ month, year }).then(unwrap),
    enabled: scopeAll ? true : !!month && !!year,
    ...options,
  });
};

export const useMyTimesheetAll = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: ["myTimesheet", "all"],
    queryFn: () => rotaService.getMyTimesheetAll().then(unwrap),
    staleTime: 1000 * 60 * 2,
  });

export const useMyTimesheet = (month?: number | string | null, year?: number | string | null, options: any = {}): UseQueryResult<any, Error> => {
  const scopeAll = options.scope === "all" || month == null || year == null;
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: scopeAll ? ["myTimesheet", "all"] : ["myTimesheet", month, year],
    queryFn: () =>
      scopeAll
        ? rotaService.getMyTimesheetAll().then(unwrap)
        : rotaService.getMyTimesheet({ month, year }).then(unwrap),
    enabled: scopeAll ? true : !!month && !!year,
    ...options,
  });
};

export const usePendingTimesheets = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: ["pendingTimesheets"],
    queryFn: () => rotaService.getPendingTimesheets().then(unwrap),
  });

export const useTimesheetDetail = (id: string | number): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: ["timesheetDetail", id],
    queryFn: () => rotaService.getTimesheetDetail(id).then(unwrap),
    enabled: !!id,
  });

export const useClinicianTimesheet = (clinicianId: string | number, month: number | string, year: number | string): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["clinicianTimesheet", clinicianId, month, year],
    queryFn: () => rotaService.getClinicianTimesheet(clinicianId, month, year).then(unwrap),
    enabled: !!clinicianId && !!month && !!year,
  });

export const useRota = (id: string | number): UseQueryResult<RotaShift, Error> =>
  useQuery({
    queryKey: keyRota(id),
    queryFn: () => rotaService.getRotaById(id).then((r: any) => r.data),
    enabled: !!id,
  });

export const useClinicianRota = (clinicianId: string | number, month: number | string, year: number | string, params: any = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["rota", "clinician", clinicianId, { month, year, ...params }],
    queryFn: () =>
      rotaService.getClinicianRota(clinicianId, month, year, params).then((r: any) => r.data),
    enabled: !!clinicianId && !!month && !!year,
  });

export const useGapReport = (days: number = 14): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.ROTA_GAPS ? QK.ROTA_GAPS({ days }) : ["rota", "gaps", { days }],
    queryFn: () => rotaService.getGapReport(days).then((r: any) => r.data),
  });

export const useCoverRequests = (params: any = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: QK.ROTA_COVER_REQUESTS
      ? QK.ROTA_COVER_REQUESTS(params)
      : ["rota", "cover-requests", params],
    queryFn: () => rotaService.getCoverRequests(params).then((r: any) => r.data),
  });

export const useComplianceCheck = (clinicianId: string | number, options: any = {}): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: keyCompliance(clinicianId),
    queryFn: () =>
      rotaService.checkMandatoryCompliance(clinicianId).then((r: any) => r.data),
    enabled: !!clinicianId && (options.enabled ?? false),
    staleTime: 1000 * 60 * 2, // 2 min — compliance status changes infrequently
    ...options,
  });

export const useRestrictedClinicianCheck = (clinicianId: string | number, practiceId: string | number, options: any = {}): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: keyRestricted(clinicianId, practiceId),
    queryFn: () =>
      rotaService.checkRestrictedClinician(clinicianId, practiceId).then((r: any) => r.data),
    enabled: !!clinicianId && !!practiceId && (options.enabled ?? false),
    staleTime: 1000 * 60 * 5, // 5 min
    ...options,
  });

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export const useCreateRota = (options: any = {}): UseMutationResult<any, Error, any> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => rotaService.createShift(data).then((r: any) => r.data),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useCreateBulkRota = (options: any = {}): UseMutationResult<any, Error, any> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => rotaService.createBulkShifts(data).then((r: any) => r.data),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useUpdateRota = (options: any = {}): UseMutationResult<any, Error, { id: string | number; data: any }> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      rotaService.updateShift(id, data).then((r: any) => r.data),
    onSuccess: (result: any, { id }: { id: string | number }, ctx: any) => {
      qc.setQueryData(keyRota(id), result);
      qc.invalidateQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { id }, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useUpdateShiftStatus = (options: any = {}): UseMutationResult<any, Error, { id: string | number; status: string }> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      rotaService.updateShiftStatus(id, { status }).then((r: any) => r.data),
    onSuccess: (result: any, { id }: { id: string | number }, ctx: any) => {
      qc.setQueryData(keyRota(id), result);
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { id }, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useDeleteRota = (options: any = {}): UseMutationResult<any, Error, string | number> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => rotaService.deleteShift(id).then((r: any) => r.data),
    onSuccess: (_result: any, id: string | number, ctx: any) => {
      qc.removeQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(_result, id, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useAssignCover = (options: any = {}): UseMutationResult<any, Error, any> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => rotaService.assignCover(data).then((r: any) => r.data),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useAssignCoverToShift = (options: any = {}): UseMutationResult<any, Error, { gapShiftId: string | number; clinicianId: string | number; [key: string]: any }> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ gapShiftId, clinicianId, ...rest }: { gapShiftId: string | number; clinicianId: string | number; [key: string]: any }) =>
      rotaService
        .assignCover({ original_gap_id: gapShiftId, clinician_id: clinicianId, is_cover: true, ...rest })
        .then((r: any) => r.data),
    onSuccess: (result: any, { gapShiftId }: { gapShiftId: string | number }, ctx: any) => {
      qc.invalidateQueries({ queryKey: keyRota(gapShiftId) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { gapShiftId }, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useSendRotaToClient = (options: any = {}): UseMutationResult<any, Error, { clientId: string | number; data: any }> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string | number; data: any }) =>
      rotaService.sendRotaToClient(clientId, data).then((r: any) => r.data),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useGenerateRota = (options: any = {}): UseMutationResult<any, Error, { month: number | string; year: number | string }> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number | string; year: number | string }) =>
      rotaService.generateMonthlyRota(month, year).then((r: any) => r.data),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err: Error, vars: any, ctx: any) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

export const useSendRotaToClients = (options: any = {}): UseMutationResult<any, Error, { month: number | string; year: number | string }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year }: { month: number | string; year: number | string }) => rotaService.sendRotaToClients(month, year).then(unwrap),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: options.onError,
  });
};

export const useUpsertTimesheetEntryForShift = (options: any = {}): UseMutationResult<any, Error, { shiftId: string | number; data: any }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, data }: { shiftId: string | number; data: any }) =>
      rotaService.upsertTimesheetEntryForShift(shiftId, data).then(unwrap),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["myTimesheet"] });
      qc.invalidateQueries({ queryKey: ["myRota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: options.onError,
  });
};

export const useUpdateTimesheetEntry = (options: any = {}): UseMutationResult<any, Error, { entryId: string | number; data: any }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string | number; data: any }) => rotaService.updateTimesheetEntry(entryId, data).then(unwrap),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["myTimesheet"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: options.onError,
  });
};

export const useSubmitTimesheet = (options: any = {}): UseMutationResult<any, Error, string | number> & { isLoading: boolean } => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (timesheetId: string | number) => rotaService.submitTimesheet(timesheetId).then(unwrap),
    onSuccess: (result: any, vars: any, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["myTimesheet"] });
      qc.invalidateQueries({ queryKey: ["pendingTimesheets"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: options.onError,
  });
  return { ...mutation, isLoading: mutation.isPending } as any;
};

export const useApproveTimesheetRota = (options: any = {}): UseMutationResult<any, Error, string | number> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => rotaService.approveTimesheet(id).then(unwrap),
    onSuccess: (result: any, id: string | number, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["pendingTimesheets"] });
      qc.invalidateQueries({ queryKey: ["timesheetDetail", id] });
      qc.invalidateQueries({ queryKey: ["clinicianTimesheet"] });
      options.onSuccess?.(result, id, ctx);
    },
    onError: options.onError,
  });
};

export const useRejectTimesheetRota = (options: any = {}): UseMutationResult<any, Error, { id: string | number; reason: string }> => {
  const qc = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: ({ id, reason }: { id: string | number; reason: string }) => rotaService.rejectTimesheet(id, reason).then(unwrap),
    onSuccess: (result: any, { id }: { id: string | number }, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["pendingTimesheets"] });
      qc.invalidateQueries({ queryKey: ["timesheetDetail", id] });
      qc.invalidateQueries({ queryKey: ["clinicianTimesheet"] });
      options.onSuccess?.(result, { id }, ctx);
    },
    onError: options.onError,
  });
};

export { useApproveTimesheetRota as useApproveTimesheet, useRejectTimesheetRota as useRejectTimesheet };



