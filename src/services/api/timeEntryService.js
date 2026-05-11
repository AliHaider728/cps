/**
 * services/api/timeEntryService.js — Rota Module (Clock-In / Clock-Out)
 *
 * API service for time entry endpoints (/api/time-entries).
 */

import { apiClient } from "./client";

const base = "/time-entries";

export const timeEntryService = {
  /** Clinician: clock in for a shift. shiftId is optional. */
  clockIn: (data = {}) => apiClient.post(`${base}/clock-in`, data),

  /** Clinician: clock out from current active entry. */
  clockOut: () => apiClient.post(`${base}/clock-out`),

  /**
   * Get active clock-in entry.
   * Clinician: own entry.
   * Admin: pass { clinicianId } as params.
   */
  getActive: (params = {}) => apiClient.get(`${base}/active`, { params }),

  /**
   * List time entries.
   * Params: clinicianId, from, to, status, limit
   */
  list: (params = {}) => apiClient.get(base, { params }),

  /**
   * Super admin: aggregated summary of all clinicians this month.
   */
  getAdminSummary: () => apiClient.get(`${base}/admin/summary`),
};

export default timeEntryService;
