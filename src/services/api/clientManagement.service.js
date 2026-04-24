// src/services/api/clientManagement.service.js
import apiClient from "./client";

/* ══════════════════════════════════════════════════════════════════
   HIERARCHY / SEARCH / ICB / FEDERATION
══════════════════════════════════════════════════════════════════ */
export const clientManagementService = {
  getHierarchy:   ()        => apiClient.get("/clients/hierarchy"),
  search:         (q)       => apiClient.get("/clients/search", { params: { q } }),
  getICBs:        ()        => apiClient.get("/clients/icb"),
  getICBById:     (id)      => apiClient.get(`/clients/icb/${id}`),
  createICB:      (data)    => apiClient.post("/clients/icb", data),
  updateICB:      (id, data)=> apiClient.put(`/clients/icb/${id}`, data),
  deleteICB:      (id)      => apiClient.delete(`/clients/icb/${id}`),

  getFederations: (icbId)   => apiClient.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
  createFederation:(data)   => apiClient.post("/clients/federation", data),
  updateFederation:(id,data)=> apiClient.put(`/clients/federation/${id}`, data),
  deleteFederation:(id)     => apiClient.delete(`/clients/federation/${id}`),
};

/* ══════════════════════════════════════════════════════════════════
   PCN
══════════════════════════════════════════════════════════════════ */
export const pcnService = {
  getAll:   (params = {}) => apiClient.get("/clients/pcn", { params }),
  getById:  (id)          => apiClient.get(`/clients/pcn/${id}`),
  create:   (data)        => apiClient.post("/clients/pcn", data),
  update:   (id, data)    => apiClient.put(`/clients/pcn/${id}`, data),
  delete:   (id)          => apiClient.delete(`/clients/pcn/${id}`),
  rollup:   (id)          => apiClient.get(`/clients/pcn/${id}/rollup`),

  getMeetings:    (id)        => apiClient.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting:  (id, data)  => apiClient.post(`/clients/pcn/${id}/meetings`, data),

  getClientFacing:    (id)        => apiClient.get(`/clients/pcn/${id}/client-facing`),
  updateClientFacing: (id, data)  => apiClient.put(`/clients/pcn/${id}/client-facing`, data),

  updateRestricted: (id, clinicianIds) =>
    apiClient.put(`/clients/pcn/${id}/restricted`, { clinicianIds }),
};

/* ══════════════════════════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════════════════════════ */
export const practiceService = {
  getAll:   (params = {}) => apiClient.get("/clients/practice", { params }),
  getById:  (id)          => apiClient.get(`/clients/practice/${id}`),
  create:   (data)        => apiClient.post("/clients/practice", data),
  update:   (id, data)    => apiClient.put(`/clients/practice/${id}`, data),
  delete:   (id)          => apiClient.delete(`/clients/practice/${id}`),

  updateRestricted: (id, clinicianIds) =>
    apiClient.put(`/clients/practice/${id}/restricted`, { clinicianIds }),
};

/* ══════════════════════════════════════════════════════════════════
   CONTACT HISTORY
   Endpoints (from clientRoutes.js):
     GET    /clients/:entityType/:entityId/history
     POST   /clients/:entityType/:entityId/history
     PUT    /clients/history/:logId
     PATCH  /clients/history/:logId/star
     DELETE /clients/history/:logId
══════════════════════════════════════════════════════════════════ */
export const historyService = {
  /**
   * Get contact history for an entity.
   * @param {string} entityType  "PCN" | "Practice" | "Federation" | "ICB"
   * @param {string} entityId    UUID string
   * @param {object} params      Optional: { type, starred, page, limit }
   */
  get: (entityType, entityId, params = {}) =>
    apiClient.get(`/clients/${entityType}/${entityId}/history`, { params }),

  /**
   * Add a new contact log entry.
   */
  add: (entityType, entityId, data) =>
    apiClient.post(`/clients/${entityType}/${entityId}/history`, data),

  /**
   * Update an existing log entry by ID.
   */
  update: (logId, data) =>
    apiClient.put(`/clients/history/${logId}`, data),

  /**
   * Toggle starred status of a log.
   */
  toggleStar: (logId) =>
    apiClient.patch(`/clients/history/${logId}/star`),

  /**
   * Delete a log entry.
   */
  delete: (logId) =>
    apiClient.delete(`/clients/history/${logId}`),
};

/* ══════════════════════════════════════════════════════════════════
   DECISION MAKERS
══════════════════════════════════════════════════════════════════ */
export const decisionMakersService = {
  get:    (entityType, entityId)        => apiClient.get(`/clients/${entityType}/${entityId}/decision-makers`),
  update: (entityType, entityId, data)  => apiClient.put(`/clients/${entityType}/${entityId}/decision-makers`, data),
};

/* ══════════════════════════════════════════════════════════════════
   FINANCE CONTACTS
══════════════════════════════════════════════════════════════════ */
export const financeContactsService = {
  get:    (entityType, entityId)        => apiClient.get(`/clients/${entityType}/${entityId}/finance-contacts`),
  update: (entityType, entityId, data)  => apiClient.put(`/clients/${entityType}/${entityId}/finance-contacts`, data),
};

/* ══════════════════════════════════════════════════════════════════
   REPORTING ARCHIVE
══════════════════════════════════════════════════════════════════ */
export const reportingArchiveService = {
  get:    (entityType, entityId, params = {}) =>
    apiClient.get(`/clients/${entityType}/${entityId}/reporting-archive`, { params }),
  add:    (entityType, entityId, formData) =>
    apiClient.post(`/clients/${entityType}/${entityId}/reporting-archive`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (entityType, entityId, reportId) =>
    apiClient.delete(`/clients/${entityType}/${entityId}/reporting-archive/${reportId}`),
};

/* ══════════════════════════════════════════════════════════════════
   SYSTEM ACCESS + MASS EMAIL
══════════════════════════════════════════════════════════════════ */
export const systemAccessService = {
  request: (entityType, entityId, data) =>
    apiClient.post(`/clients/${entityType}/${entityId}/system-access`, data),
};

export const massEmailService = {
  send: (entityType, entityId, data) =>
    apiClient.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};

export default clientManagementService;