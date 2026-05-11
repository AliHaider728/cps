/**
 * hooks/useTimeEntry.js — Rota Module (Clock-In / Clock-Out)
 *
 * TanStack Query hooks for time entry operations.
 * Follows same pattern as useRota.js, useClinician.js, etc.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeEntryService } from "../services/api/timeEntryService";

/* ─── Query Keys ─────────────────────────────────────────────── */
const QK_ACTIVE         = ["time-entries", "active"];
const QK_LIST           = (params) => ["time-entries", "list", params];
const QK_ADMIN_SUMMARY  = ["time-entries", "admin-summary"];

/* ─── Get active clock-in entry (clinician) ──────────────────── */
export const useActiveTimeEntry = (options = {}) =>
  useQuery({
    queryKey: QK_ACTIVE,
    queryFn:  () => timeEntryService.getActive().then((r) => r.data?.data ?? null),
    refetchInterval: 30_000, // refresh every 30s to keep timer in sync
    ...options,
  });

/* ─── List time entries ──────────────────────────────────────── */
export const useTimeEntries = (params = {}, options = {}) =>
  useQuery({
    queryKey: QK_LIST(params),
    queryFn:  () => timeEntryService.list(params).then((r) => r.data?.data ?? []),
    ...options,
  });

/* ─── Admin summary ──────────────────────────────────────────── */
export const useTimeEntryAdminSummary = (options = {}) =>
  useQuery({
    queryKey: QK_ADMIN_SUMMARY,
    queryFn:  () => timeEntryService.getAdminSummary().then((r) => r.data?.data ?? {}),
    staleTime: 60_000, // 1 min
    ...options,
  });

/* ─── Clock In mutation ──────────────────────────────────────── */
export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => timeEntryService.clockIn(data).then((r) => r.data?.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK_ACTIVE });
      queryClient.invalidateQueries({ queryKey: ["time-entries", "list"] });
    },
  });
};

/* ─── Clock Out mutation ─────────────────────────────────────── */
export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => timeEntryService.clockOut().then((r) => r.data?.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK_ACTIVE });
      queryClient.invalidateQueries({ queryKey: ["time-entries", "list"] });
      queryClient.invalidateQueries({ queryKey: QK_ADMIN_SUMMARY });
    },
  });
};
