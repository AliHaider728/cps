/**
 * @file useRota.js
 * @description Complete hooks for Clinician Rota Management
 *
 * Updated (May 2026):
 *   - useMyRota: Fetch clinician's shifts for calendar view
 *   - useClinicianRota: Fetch any clinician's rota (admin use)
 *   - useMyTimesheet: Fetch timesheet + seeded entries from shifts
 *   - useUpdateTimesheetEntry: Update single entry (start/end time, notes)
 *   - useSubmitTimesheet: Submit timesheet for approval
 *   - Query keys structured for correct invalidation
 *   - Fallback for multiple response formats (backend variation)
 *
 * Integration:
 *   - ClinicianDashboard → useMyRota (fetch shifts for calendar)
 *   - MyTimesheetPage → useMyTimesheet (edit + track hours)
 *   - Admin panels → useClinicianRota (manage any clinician's rota)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

/* ─────────────────────────────────────────────────────────────────────────
   QUERY KEY FACTORY
───────────────────────────────────────────────────────────────────────── */

const QK = {
  // Shifts/Rota
  rota: ["rota"],
  myRota: (month, year) => ["rota", "my", month, year],
  clinicianRota: (clinicianId, month, year) => ["rota", "clinician", clinicianId, month, year],

  // Timesheets
  timesheets: ["timesheets"],
  myTimesheet: (month, year) => ["timesheet", "my", month, year],
  timesheetDetail: (id) => ["timesheet", id],

  // Timesheet Entries
  entries: ["timesheet-entries"],
  entryDetail: (id) => ["timesheet-entry", id],
};

/* ─────────────────────────────────────────────────────────────────────────
   ROTA HOOKS — Shift Management
───────────────────────────────────────────────────────────────────────── */

/**
 * useMyRota: Fetch current clinician's shifts for a given month/year
 * Used by: ClinicianDashboard
 *
 * Returns: { shifts: [...], data: { shifts: [...] } }
 * Normalizes both response formats automatically
 */
export const useMyRota = (month = new Date().getMonth() + 1, year = new Date().getFullYear(), options = {}) => {
  return useQuery({
    queryKey: QK.myRota(month, year),
    queryFn: async () => {
      const response = await apiClient.get("/rota/clinician", {
        params: { month, year },
      });
      // Handle both response formats
      const data = response.data?.data ?? response.data;
      return {
        shifts: data?.shifts ?? data?.data?.shifts ?? data ?? [],
        data: data,
      };
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useClinicianRota: Fetch any clinician's shifts (admin use)
 * Used by: Admin rota management, supervisor dashboards
 *
 * @param {string} clinicianId - UUID of the clinician
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 */
export const useClinicianRota = (
  clinicianId,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  options = {}
) => {
  return useQuery({
    queryKey: QK.clinicianRota(clinicianId, month, year),
    queryFn: async () => {
      if (!clinicianId) throw new Error("clinicianId is required");

      const response = await apiClient.get(`/rota/clinician/${clinicianId}`, {
        params: { month, year },
      });

      const data = response.data?.data ?? response.data;
      return {
        shifts: data?.shifts ?? data?.data?.shifts ?? data ?? [],
        data: data,
      };
    },
    enabled: !!clinicianId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   TIMESHEET HOOKS — Entry Management
───────────────────────────────────────────────────────────────────────── */

/**
 * useMyTimesheet: Fetch current clinician's timesheet + entries
 * Used by: MyTimesheetPage
 *
 * Backend auto-seeds entries from rota_shifts if not present
 * Returns: { timesheet: {...}, entries: [...] }
 */
export const useMyTimesheet = (
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  options = {}
) => {
  return useQuery({
    queryKey: QK.myTimesheet(month, year),
    queryFn: async () => {
      const response = await apiClient.get("/timesheets", {
        params: { month, year },
      });

      const data = response.data?.data ?? response.data;
      return {
        timesheet: data?.timesheet ?? null,
        entries: data?.entries ?? data?.data?.entries ?? [],
        data: data,
      };
    },
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes (more volatile than rota)
    ...options,
  });
};

/**
 * useUpdateTimesheetEntry: Mutate a single timesheet entry
 * Used by: MyTimesheetPage (inline editing)
 *
 * @param {string} entryId - UUID of the timesheet_entry
 * @param {Object} data - { start_time, end_time, notes }
 */
export const useUpdateTimesheetEntry = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, data }) => {
      if (!entryId) throw new Error("entryId is required");

      const response = await apiClient.patch(`/timesheet-entries/${entryId}`, data);
      return response.data?.data ?? response.data;
    },

    onSuccess: (data, variables) => {
      // Invalidate entry detail cache
      qc.invalidateQueries({ queryKey: QK.entryDetail(variables.entryId) });

      // Invalidate all timesheet caches (entries may affect totals)
      qc.invalidateQueries({ queryKey: QK.timesheets });
      qc.invalidateQueries({ queryKey: ["timesheet"] });

      options.onSuccess?.(data, variables);
    },

    onError: (error) => {
      console.error("Failed to update timesheet entry:", error);
      options.onError?.(error);
    },
  });
};

/**
 * useSubmitTimesheet: Submit entire timesheet for approval
 * Used by: MyTimesheetPage (submit button)
 *
 * @param {string} timesheetId - UUID of the timesheet
 */
export const useSubmitTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (timesheetId) => {
      if (!timesheetId) throw new Error("timesheetId is required");

      const response = await apiClient.post(`/timesheets/${timesheetId}/submit`);
      return response.data?.data ?? response.data;
    },

    onSuccess: (data, timesheetId) => {
      // Invalidate specific timesheet detail
      qc.invalidateQueries({ queryKey: QK.timesheetDetail(timesheetId) });

      // Invalidate all timesheet list queries (status changed)
      qc.invalidateQueries({ queryKey: QK.timesheets });

      options.onSuccess?.(data);
    },

    onError: (error) => {
      console.error("Failed to submit timesheet:", error);
      options.onError?.(error);
    },
  });
};

/**
 * useApproveTimesheet: Approve a submitted timesheet (admin only)
 * Used by: TimeSheet approval pages
 */
export const useApproveTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ timesheetId, notes = "" }) => {
      if (!timesheetId) throw new Error("timesheetId is required");

      const response = await apiClient.post(`/timesheets/${timesheetId}/approve`, { notes });
      return response.data?.data ?? response.data;
    },

    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: QK.timesheetDetail(variables.timesheetId) });
      qc.invalidateQueries({ queryKey: QK.timesheets });

      options.onSuccess?.(data);
    },

    onError: (error) => {
      console.error("Failed to approve timesheet:", error);
      options.onError?.(error);
    },
  });
};

/**
 * useRejectTimesheet: Reject a submitted timesheet (admin only)
 * Used by: TimeSheet approval pages
 */
export const useRejectTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ timesheetId, reason = "" }) => {
      if (!timesheetId) throw new Error("timesheetId is required");
      if (!reason) throw new Error("rejection reason is required");

      const response = await apiClient.post(`/timesheets/${timesheetId}/reject`, { reason });
      return response.data?.data ?? response.data;
    },

    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: QK.timesheetDetail(variables.timesheetId) });
      qc.invalidateQueries({ queryKey: QK.timesheets });

      options.onSuccess?.(data);
    },

    onError: (error) => {
      console.error("Failed to reject timesheet:", error);
      options.onError?.(error);
    },
  });
};

/**
 * useTimesheetAdminSummary: Fetch admin dashboard summary
 * Used by: TimeSheet admin dashboard
 */
export const useTimesheetAdminSummary = (options = {}) => {
  return useQuery({
    queryKey: ["timesheet", "admin-summary"],
    queryFn: async () => {
      const response = await apiClient.get("/timesheets/admin/summary");
      return response.data?.data ?? response.data ?? {};
    },
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes (not real-time)
    ...options,
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   BATCH OPERATIONS
───────────────────────────────────────────────────────────────────────── */

/**
 * useUpdateMultipleEntries: Batch update timesheet entries
 * Used by: Admin bulk operations, performance optimization
 */
export const useUpdateMultipleEntries = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entries) => {
      // entries: Array<{ id, start_time, end_time, notes }>
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error("entries array is required");
      }

      const response = await apiClient.post("/timesheet-entries/bulk-update", { entries });
      return response.data?.data ?? response.data;
    },

    onSuccess: (data) => {
      // Invalidate all entry caches
      qc.invalidateQueries({ queryKey: QK.entries });
      qc.invalidateQueries({ queryKey: QK.timesheets });

      options.onSuccess?.(data);
    },

    onError: (error) => {
      console.error("Failed to update entries:", error);
      options.onError?.(error);
    },
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   EXPORT SUMMARY
───────────────────────────────────────────────────────────────────────── */

export default {
  // Rota queries
  useMyRota,
  useClinicianRota,

  // Timesheet queries
  useMyTimesheet,
  useTimesheetAdminSummary,

  // Mutations
  useUpdateTimesheetEntry,
  useSubmitTimesheet,
  useApproveTimesheet,
  useRejectTimesheet,
  useUpdateMultipleEntries,

  // Query keys (for manual invalidation if needed)
  QK,
};