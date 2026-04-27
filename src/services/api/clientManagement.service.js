// src/services/api/clientManagement.service.js
import apiClient from "./client.js";

/* ══════════════════════════════════════════════════════════════════
   HIERARCHY / SEARCH / ICB / FEDERATION
══════════════════════════════════════════════════════════════════ */
export const clientManagementService = {
  getHierarchy:    ()            => apiClient.get("/clients/hierarchy"),
  search:          (q)           => apiClient.get("/clients/search", { params: { q } }),
  getICBs:         ()            => apiClient.get("/clients/icb"),
  getICBById:      (id)          => apiClient.get(`/clients/icb/${id}`),
  createICB:       (data)        => apiClient.post("/clients/icb", data),
  updateICB:       (id, data)    => apiClient.put(`/clients/icb/${id}`, data),
  deleteICB:       (id)          => apiClient.delete(`/clients/icb/${id}`),

  getFederations:  (icbId)       => apiClient.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
  createFederation:(data)        => apiClient.post("/clients/federation", data),
  updateFederation:(id, data)    => apiClient.put(`/clients/federation/${id}`, data),
  deleteFederation:(id)          => apiClient.delete(`/clients/federation/${id}`),
};

/* ══════════════════════════════════════════════════════════════════
   PCN
══════════════════════════════════════════════════════════════════ */
export const pcnService = {
  getAll:  (params = {}) => apiClient.get("/clients/pcn", { params }),
  getById: (id)          => apiClient.get(`/clients/pcn/${id}`),
  create:  (data)        => apiClient.post("/clients/pcn", data),
  update:  (id, data)    => apiClient.put(`/clients/pcn/${id}`, data),
  delete:  (id)          => apiClient.delete(`/clients/pcn/${id}`),
  rollup:  (id)          => apiClient.get(`/clients/pcn/${id}/rollup`),

  getMeetings:   (id)       => apiClient.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting: (id, data) => apiClient.post(`/clients/pcn/${id}/meetings`, data),

  getClientFacing:    (id)       => apiClient.get(`/clients/pcn/${id}/client-facing`),
  updateClientFacing: (id, data) => apiClient.put(`/clients/pcn/${id}/client-facing`, data),

  updateRestricted: (id, clinicianIds) =>
    apiClient.put(`/clients/pcn/${id}/restricted`, { clinicianIds }),
};

/* ══════════════════════════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════════════════════════ */
export const practiceService = {
  getAll:  (params = {}) => apiClient.get("/clients/practice", { params }),
  getById: (id)          => apiClient.get(`/clients/practice/${id}`),
  create:  (data)        => apiClient.post("/clients/practice", data),
  update:  (id, data)    => apiClient.put(`/clients/practice/${id}`, data),
  delete:  (id)          => apiClient.delete(`/clients/practice/${id}`),

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
  get: (entityType, entityId, params = {}) =>
    apiClient.get(`/clients/${entityType}/${entityId}/history`, { params }),

  add: (entityType, entityId, data) =>
    apiClient.post(`/clients/${entityType}/${entityId}/history`, data),

  update: (logId, data) =>
    apiClient.put(`/clients/history/${logId}`, data),

  toggleStar: (logId) =>
    apiClient.patch(`/clients/history/${logId}/star`),

  delete: (logId) =>
    apiClient.delete(`/clients/history/${logId}`),
};

/* ══════════════════════════════════════════════════════════════════
   DECISION MAKERS
══════════════════════════════════════════════════════════════════ */
export const decisionMakersService = {
  get:    (entityType, entityId)       => apiClient.get(`/clients/${entityType}/${entityId}/decision-makers`),
  update: (entityType, entityId, data) => apiClient.put(`/clients/${entityType}/${entityId}/decision-makers`, data),
};

/* ══════════════════════════════════════════════════════════════════
   FINANCE CONTACTS
══════════════════════════════════════════════════════════════════ */
export const financeContactsService = {
  get:    (entityType, entityId)       => apiClient.get(`/clients/${entityType}/${entityId}/finance-contacts`),
  update: (entityType, entityId, data) => apiClient.put(`/clients/${entityType}/${entityId}/finance-contacts`, data),
};

/* ══════════════════════════════════════════════════════════════════
   REPORTING ARCHIVE

     FIX: Do NOT manually set "Content-Type": "multipart/form-data".
   When axios sends a FormData object, it automatically sets the
   Content-Type header WITH the correct multipart boundary string,
   e.g.:  Content-Type: multipart/form-data; boundary=----XYZ
   Manually setting the header removes the boundary, which causes
   multer on the server to fail parsing and return:
     400 { message: "A report file is required" }
══════════════════════════════════════════════════════════════════ */
export const reportingArchiveService = {
  get: (entityType, entityId, params = {}) =>
    apiClient.get(`/clients/${entityType}/${entityId}/reporting-archive`, { params }),

  /**
   * Upload a report file.
   * @param {string}   entityType  "PCN" | "Practice"
   * @param {string}   entityId    MongoDB ObjectId string
   * @param {FormData} formData    Must include: file, month, year.
   *                               Optional: notes, starred.
   *
   *   NO manual Content-Type — axios sets it automatically with boundary.
   */
  add: (entityType, entityId, formData) =>
    apiClient.post(
      `/clients/${entityType}/${entityId}/reporting-archive`,
      formData,
      // ── intentionally no `headers` override here ──
    ),

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