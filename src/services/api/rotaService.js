import { apiClient } from "./client";

const base = "/rota";

export const rotaService = {
  // ── Grid & diary ──────────────────────────────────────────────────────────
  getRotaGrid: (month, year, params = {}) =>
    apiClient.get(base, { params: { month, year, ...params } }),

  getClinicianRota: (clinicianId, month, year, params = {}) =>
    apiClient.get(`${base}/clinician/${clinicianId}`, {
      params: { month, year, ...params },
    }),

  getRotaById: (id) => apiClient.get(`${base}/shift/${id}`),

  // ── Shift CRUD ────────────────────────────────────────────────────────────
  createShift: (data) => apiClient.post(`${base}/shift`, data),

  // ✅ FIX: was PUT — backend route is PATCH /shift/:id
  updateShift: (id, data) => apiClient.patch(`${base}/shift/${id}`, data),

  // ✅ NEW: status-only patch (used by useUpdateShiftStatus hook)
  updateShiftStatus: (id, data) => apiClient.patch(`${base}/shift/${id}`, data),

  deleteShift: (id) => apiClient.delete(`${base}/shift/${id}`),

  // ── Generate ──────────────────────────────────────────────────────────────
  generateMonthlyRota: (month, year) =>
    apiClient.post(`${base}/generate`, { month, year }),

  // ── Gaps ──────────────────────────────────────────────────────────────────
  getGapReport: (days = 14) =>
    apiClient.get(`${base}/gaps`, { params: { days } }),

  // ── Cover ─────────────────────────────────────────────────────────────────
  assignCover: (data) => apiClient.post(`${base}/cover`, data),

  getCoverRequests: (params = {}) =>
    apiClient.get(`${base}/cover-requests`, { params }),

  // ── Compliance / restriction checks ──────────────────────────────────────
  checkRestrictedClinician: (clinicianId, practiceId) =>
    apiClient.get(`${base}/checks/restricted`, {
      params: { clinicianId, practiceId },
    }),

  checkMandatoryCompliance: (clinicianId) =>
    apiClient.get(`${base}/checks/compliance`, { params: { clinicianId } }),

  // ── Send rota to client ───────────────────────────────────────────────────
  sendRotaToClient: (clientId, data) =>
    apiClient.post(`${base}/send/${clientId}`, data),
};

export default rotaService;