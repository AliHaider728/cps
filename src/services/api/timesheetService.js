import { apiClient } from "./client";

const unwrap = (request) => request.then((response) => response.data?.data ?? response.data);

export const timesheetService = {
  getMyTimesheet: (month, year) => unwrap(apiClient.get(`/timesheets/my/${month}/${year}`)),
  updateEntry: (entryId, data) => unwrap(apiClient.put(`/timesheets/entries/${entryId}`, data)),
  submitTimesheet: (timesheetId) => unwrap(apiClient.post("/timesheets/submit", { timesheetId })),
  getPendingTimesheets: () => unwrap(apiClient.get("/timesheets/pending")),
  getTimesheetDetail: (id) => unwrap(apiClient.get(`/timesheets/${id}/detail`)),
  approveTimesheet: (id) => unwrap(apiClient.post(`/timesheets/${id}/approve`)),
  rejectTimesheet: (id, reason) => unwrap(apiClient.post(`/timesheets/${id}/reject`, { rejection_reason: reason })),
  getTimesheetHistory: (filters = {}) => unwrap(apiClient.get("/timesheets/history", { params: filters })),
};

export const coverService = {
  getOpen: () => unwrap(apiClient.get("/cover/open")),
  create: (data) => unwrap(apiClient.post("/cover/create", data)),
  assign: (id, clinician_id) => unwrap(apiClient.post(`/cover/${id}/assign`, { clinician_id })),
};

export const basePatternService = {
  getByClinician: (clinicianId) => unwrap(apiClient.get(`/base-patterns/${clinicianId}`)),
  create: (data) => unwrap(apiClient.post("/base-patterns", data)),
  update: (id, data) => unwrap(apiClient.put(`/base-patterns/${id}`, data)),
  deactivate: (id) => unwrap(apiClient.delete(`/base-patterns/${id}`)),
};

export default timesheetService;
