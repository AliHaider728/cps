import { apiClient } from "./client";
import { AxiosResponse } from "axios";

const base = "/rota";

export const rotaService = {
  generateRota: (month: number | string, year: number | string): Promise<AxiosResponse> => apiClient.post(`${base}/generate`, { month, year }),
  getMonthlyRota: (month: number | string, year: number | string): Promise<AxiosResponse> => apiClient.get(base, { params: { month, year } }),
  getRotaGaps: (): Promise<AxiosResponse> => apiClient.get(`${base}/gaps`),
  sendRotaToClients: (month: number | string, year: number | string): Promise<AxiosResponse> => apiClient.post(`${base}/send-to-clients`, { month, year }),

  getMyRota: (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get(`${base}/my`, { params }),
  getMyRotaAll: (): Promise<AxiosResponse> => apiClient.get(`${base}/my`, { params: { scope: "all" } }),
  getMyTimesheet: (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get(`${base}/timesheet/my`, { params }),
  getMyTimesheetAll: (): Promise<AxiosResponse> => apiClient.get(`${base}/timesheet/my`, { params: { scope: "all" } }),
  updateTimesheetEntry: (entryId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`${base}/timesheet/entry/${entryId}`, data),
  upsertTimesheetEntryForShift: (shiftId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.put(`${base}/timesheet/shift/${shiftId}`, data),
  submitTimesheet: (timesheetId: string | number): Promise<AxiosResponse> => apiClient.post(`${base}/timesheet/${timesheetId}/submit`),

  getPendingTimesheets: (): Promise<AxiosResponse> => apiClient.get(`${base}/timesheets/pending`),
  getClinicianTimesheet: (clinicianId: string | number, month: number | string, year: number | string): Promise<AxiosResponse> =>
    apiClient.get(`${base}/timesheets/clinician/${clinicianId}`, { params: { month, year } }),
  getTimesheetDetail: (id: string | number): Promise<AxiosResponse> => apiClient.get(`${base}/timesheets/${id}/detail`),
  approveTimesheet: (id: string | number): Promise<AxiosResponse> => apiClient.post(`${base}/timesheets/${id}/approve`),
  rejectTimesheet: (id: string | number, reason: string): Promise<AxiosResponse> => apiClient.post(`${base}/timesheets/${id}/reject`, { rejection_reason: reason }),

  // ── Grid & diary ──────────────────────────────────────────────────────────
  getRotaGrid: (month: number | string, year: number | string, params: Record<string, unknown> = {}): Promise<AxiosResponse> =>
    apiClient.get(base, { params: { month, year, ...params } }),

  getClinicianRota: (clinicianId: string | number, month: number | string, year: number | string, params: Record<string, unknown> = {}): Promise<AxiosResponse> =>
    apiClient.get(`${base}/clinician/${clinicianId}`, {
      params: { month, year, ...params },
    }),

  getRotaById: (id: string | number): Promise<AxiosResponse> => apiClient.get(`${base}/shift/${id}`),

  // ── Shift CRUD ────────────────────────────────────────────────────────────
  createShift: (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`${base}/shift`, data),
  createBulkShifts: (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`${base}/bulk`, data),

  updateShift: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.patch(`${base}/shift/${id}`, data),

  updateShiftStatus: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.patch(`${base}/shift/${id}`, data),

  deleteShift: (id: string | number): Promise<AxiosResponse> => apiClient.delete(`${base}/shift/${id}`),

  // ── Generate ──────────────────────────────────────────────────────────────
  generateMonthlyRota: (month: number | string, year: number | string): Promise<AxiosResponse> =>
    apiClient.post(`${base}/generate`, { month, year }),

  // ── Gaps ──────────────────────────────────────────────────────────────────
  getGapReport: (days: number = 14): Promise<AxiosResponse> =>
    apiClient.get(`${base}/gaps`, { params: { days } }),

  // ── Cover ─────────────────────────────────────────────────────────────────
  assignCover: (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`${base}/cover`, data),

  getCoverRequests: (params: Record<string, unknown> = {}): Promise<AxiosResponse> =>
    apiClient.get(`${base}/cover-requests`, { params }),

  // ── Compliance / restriction checks ──────────────────────────────────────
  checkRestrictedClinician: (clinicianId: string | number, practiceId: string | number): Promise<AxiosResponse> =>
    apiClient.get(`${base}/checks/restricted`, {
      params: { clinicianId, practiceId },
    }),

  checkMandatoryCompliance: (clinicianId: string | number): Promise<AxiosResponse> =>
    apiClient.get(`${base}/checks/compliance`, { params: { clinicianId } }),

  // ── Send rota to client ───────────────────────────────────────────────────
  sendRotaToClient: (clientId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`${base}/send/${clientId}`, data),
};

export default rotaService;
