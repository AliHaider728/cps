import { apiClient } from "./client";
import { AxiosResponse } from "axios";

// unwrap takes a Promise<AxiosResponse> and returns Promise<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrap = (request: Promise<AxiosResponse>): Promise<any> =>
  request.then((response: AxiosResponse) => response.data?.data ?? response.data);

export const timesheetService = {
  getMyTimesheet: (month: string | number, year: string | number) => unwrap(apiClient.get(`/timesheets/my/${month}/${year}`)),
  updateEntry: (entryId: string | number, data: Record<string, unknown>) => unwrap(apiClient.put(`/timesheets/entries/${entryId}`, data)),
  submitTimesheet: (timesheetId: string | number) => unwrap(apiClient.post("/timesheets/submit", { timesheetId })),
  getPendingTimesheets: () => unwrap(apiClient.get("/timesheets/pending")),
  getTimesheetDetail: (id: string | number) => unwrap(apiClient.get(`/timesheets/${id}/detail`)),
  approveTimesheet: (id: string | number) => unwrap(apiClient.post(`/timesheets/${id}/approve`)),
  rejectTimesheet: (id: string | number, reason: string) => unwrap(apiClient.post(`/timesheets/${id}/reject`, { rejection_reason: reason })),
  getTimesheetHistory: (filters: Record<string, unknown> = {}) => unwrap(apiClient.get("/timesheets/history", { params: filters })),
};

export const coverService = {
  getOpen: () => unwrap(apiClient.get("/cover/open")),
  create: (data: Record<string, unknown>) => unwrap(apiClient.post("/cover/create", data)),
  assign: (id: string | number, clinician_id: string | number) => unwrap(apiClient.post(`/cover/${id}/assign`, { clinician_id })),
};

export const basePatternService = {
  getByClinician: (clinicianId: string | number) => unwrap(apiClient.get(`/base-patterns/${clinicianId}`)),
  create: (data: Record<string, unknown>) => unwrap(apiClient.post("/base-patterns", data)),
  update: (id: string | number, data: Record<string, unknown>) => unwrap(apiClient.put(`/base-patterns/${id}`, data)),
  deactivate: (id: string | number) => unwrap(apiClient.delete(`/base-patterns/${id}`)),
};

export default timesheetService;
