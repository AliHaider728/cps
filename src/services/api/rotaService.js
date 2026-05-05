import { apiClient } from "./client";

const base = "/rota";

export const rotaService = {
  getRotaGrid: (month, year, params = {}) =>
    apiClient.get(base, {
      params: {
        month,
        year,
        ...params,
      },
    }),

  getRotaById: (id) => apiClient.get(`${base}/shift/${id}`),

  getClinicianRota: (clinicianId, month, year, params = {}) =>
    apiClient.get(`${base}/clinician/${clinicianId}`, {
      params: {
        month,
        year,
        ...params,
      },
    }),

  generateMonthlyRota: (month, year) => apiClient.post(`${base}/generate`, { month, year }),

  createShift: (data) => apiClient.post(`${base}/shift`, data),
  updateShift: (id, data) => apiClient.put(`${base}/shift/${id}`, data),
  deleteShift: (id) => apiClient.delete(`${base}/shift/${id}`),

  getGapReport: (days = 14) => apiClient.get(`${base}/gaps`, { params: { days } }),

  assignCover: (data) => apiClient.post(`${base}/cover`, data),

  checkRestrictedClinician: (clinicianId, practiceId) =>
    apiClient.get(`${base}/checks/restricted`, { params: { clinicianId, practiceId } }),

  checkMandatoryCompliance: (clinicianId) =>
    apiClient.get(`${base}/checks/compliance`, { params: { clinicianId } }),

  sendRotaToClient: (clientId, data) => apiClient.post(`${base}/send/${clientId}`, data),

  getCoverRequests: (params = {}) => apiClient.get(`${base}/cover-requests`, { params }),
};

export default rotaService;
