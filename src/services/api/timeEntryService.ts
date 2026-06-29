/**
 * services/api/timeEntryService.ts — Rota Module (Clock-In / Clock-Out)
 *
 * API service for time entry endpoints (/api/time-entries).
 */

import apiClient from "./client";
import { AxiosResponse } from "axios";

const base = "/time-entries";

export const timeEntryService = {
  /** Clinician: clock in for a shift. shiftId is optional. */
  clockIn: (data: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.post(`${base}/clock-in`, data),

  /** Clinician: clock out from current active entry. */
  clockOut: (): Promise<AxiosResponse> => apiClient.post(`${base}/clock-out`),

  /**
   * Get active clock-in entry.
   * Clinician: own entry.
   * Admin: pass { clinicianId } as params.
   */
  getActive: (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get(`${base}/active`, { params }),

  /**
   * List time entries.
   * Params: clinicianId, from, to, status, limit
   */
  list: (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get(base, { params }),

  /**
   * Super admin: aggregated summary of all clinicians this month.
   */
  getAdminSummary: (): Promise<AxiosResponse> => apiClient.get(`${base}/admin/summary`),
};

export default timeEntryService;
