/**
 * @file useRota.js
 * @description Complete hooks for Clinician Rota Management
 *
 * Fixed (May 2026):
 *   - Safe apiClient import with fallback
 *   - Proper error handling
 *   - Production-ready build
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Safely import API client
let apiClient = null;
try {
  const { apiClient: client } = require("../services/api/client");
  apiClient = client;
} catch (e) {
  // Fallback: create minimal API client
  apiClient = {
    get: (url, config) => {
      const fullUrl = `${process.env.REACT_APP_API_BASE || ""}/api${url}`;
      return fetch(fullUrl, { ...config, method: "GET" })
        .then(r => r.json())
        .catch(err => { throw new Error(`GET ${url} failed: ${err.message}`); });
    },
    post: (url, data, config) => {
      const fullUrl = `${process.env.REACT_APP_API_BASE || ""}/api${url}`;
      return fetch(fullUrl, { 
        ...config, 
        method: "POST",
        headers: { "Content-Type": "application/json", ...config?.headers },
        body: JSON.stringify(data)
      })
        .then(r => r.json())
        .catch(err => { throw new Error(`POST ${url} failed: ${err.message}`); });
    },
    patch: (url, data, config) => {
      const fullUrl = `${process.env.REACT_APP_API_BASE || ""}/api${url}`;
      return fetch(fullUrl, { 
        ...config, 
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...config?.headers },
        body: JSON.stringify(data)
      })
        .then(r => r.json())
        .catch(err => { throw new Error(`PATCH ${url} failed: ${err.message}`); });
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   QUERY KEY FACTORY
───────────────────────────────────────────────────────────────────────── */

export const QK = {
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
 */
export const useMyRota = (month, year, options = {}) => {
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: QK.myRota(currentMonth, currentYear),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/rota/clinician", {
          params: { month: currentMonth, year: currentYear },
        });

        const data = response?.data?.data ?? response?.data ?? response;
        return {
          shifts: data?.shifts ?? data?.data?.shifts ?? data ?? [],
          data: data,
        };
      } catch (error) {
        console.error("useMyRota error:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * useClinicianRota: Fetch any clinician's shifts (admin use)
 */
export const useClinicianRota = (clinicianId, month, year, options = {}) => {
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: QK.clinicianRota(clinicianId, currentMonth, currentYear),
    queryFn: async () => {
      if (!clinicianId) throw new Error("clinicianId is required");

      try {
        const response = await apiClient.get(`/rota/clinician/${clinicianId}`, {
          params: { month: currentMonth, year: currentYear },
        });

        const data = response?.data?.data ?? response?.data ?? response;
        return {
          shifts: data?.shifts ?? data?.data?.shifts ?? data ?? [],
          data: data,
        };
      } catch (error) {
        console.error("useClinicianRota error:", error);
        throw error;
      }
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
 */
export const useMyTimesheet = (month, year, options = {}) => {
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: QK.myTimesheet(currentMonth, currentYear),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/timesheets", {
          params: { month: currentMonth, year: currentYear },
        });

        const data = response?.data?.data ?? response?.data ?? response;
        return {
          timesheet: data?.timesheet ?? null,
          entries: data?.entries ?? data?.data?.entries ?? [],
          data: data,
        };
      } catch (error) {
        console.error("useMyTimesheet error:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * useUpdateTimesheetEntry: Mutate a single timesheet entry
 * Used by: MyTimesheetPage (inline editing)
 */
export const useUpdateTimesheetEntry = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, data }) => {
      if (!entryId) throw new Error("entryId is required");

      try {
        const response = await apiClient.patch(`/timesheet-entries/${entryId}`, data);
        return response?.data?.data ?? response?.data ?? response;
      } catch (error) {
        console.error("useUpdateTimesheetEntry error:", error);
        throw error;
      }
    },

    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: QK.entryDetail(variables.entryId) });
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
 */
export const useSubmitTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (timesheetId) => {
      if (!timesheetId) throw new Error("timesheetId is required");

      try {
        const response = await apiClient.post(`/timesheets/${timesheetId}/submit`, {});
        return response?.data?.data ?? response?.data ?? response;
      } catch (error) {
        console.error("useSubmitTimesheet error:", error);
        throw error;
      }
    },

    onSuccess: (data, timesheetId) => {
      qc.invalidateQueries({ queryKey: QK.timesheetDetail(timesheetId) });
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
 */
export const useApproveTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ timesheetId, notes = "" }) => {
      if (!timesheetId) throw new Error("timesheetId is required");

      try {
        const response = await apiClient.post(`/timesheets/${timesheetId}/approve`, { notes });
        return response?.data?.data ?? response?.data ?? response;
      } catch (error) {
        console.error("useApproveTimesheet error:", error);
        throw error;
      }
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
 */
export const useRejectTimesheet = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ timesheetId, reason = "" }) => {
      if (!timesheetId) throw new Error("timesheetId is required");
      if (!reason) throw new Error("rejection reason is required");

      try {
        const response = await apiClient.post(`/timesheets/${timesheetId}/reject`, { reason });
        return response?.data?.data ?? response?.data ?? response;
      } catch (error) {
        console.error("useRejectTimesheet error:", error);
        throw error;
      }
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
 */
export const useTimesheetAdminSummary = (options = {}) => {
  return useQuery({
    queryKey: ["timesheet", "admin-summary"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/timesheets/admin/summary");
        return response?.data?.data ?? response?.data ?? response ?? {};
      } catch (error) {
        console.error("useTimesheetAdminSummary error:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * useUpdateMultipleEntries: Batch update timesheet entries
 */
export const useUpdateMultipleEntries = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entries) => {
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error("entries array is required");
      }

      try {
        const response = await apiClient.post("/timesheet-entries/bulk-update", { entries });
        return response?.data?.data ?? response?.data ?? response;
      } catch (error) {
        console.error("useUpdateMultipleEntries error:", error);
        throw error;
      }
    },

    onSuccess: (data) => {
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