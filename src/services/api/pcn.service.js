import apiClient from "./client";

export const pcnService = {
  getAll: (params) => apiClient.get("/clients/pcn", { params }),
  getById: (id) => apiClient.get(`/clients/pcn/${id}`),
  getRollup: (id) => apiClient.get(`/clients/pcn/${id}/rollup`),
  create: (data) => apiClient.post("/clients/pcn", data),
  update: (id, data) => apiClient.put(`/clients/pcn/${id}`, data),
  delete: (id) => apiClient.delete(`/clients/pcn/${id}`),
  updateRestricted: (id, clinicianIds) =>
    apiClient.patch(`/clients/pcn/${id}/restricted`, { clinicianIds }),
  getMeetings: (id) => apiClient.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting: (id, data) => apiClient.post(`/clients/pcn/${id}/meetings`, data),
};

export default pcnService;
