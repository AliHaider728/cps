import { authService, clientManagementService, pcnService, apiClient } from "../services/api";

const api = apiClient;

// ─────────────────────────────────────────────────────────────
// Auth & Audit
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  login:           authService.login,
  logout:          authService.logout,
  getMe:           authService.getMe,
  changePassword:  authService.changePassword,
  getAllUsers:      (params) => api.get("/auth/users", { params }),
  getUserById:     (id)     => api.get(`/auth/users/${id}`),
  createUser:      authService.createUser,
  updateUser:      authService.updateUser,
  deleteUser:      authService.deleteUser,
  anonymiseUser:   authService.anonymiseUser,
};

export const auditAPI = {
  getLogs: (params) => api.get("/audit", { params }),
};

// ─────────────────────────────────────────────────────────────
// Hierarchy, ICB, Federation, PCN, Practice
// ─────────────────────────────────────────────────────────────
export const hierarchyAPI = {
  getHierarchy: clientManagementService.getHierarchy,
  search:       clientManagementService.search,
};

export const icbAPI = {
  getAll:  clientManagementService.getICBs,
  getById: (id)       => api.get(`/clients/icb/${id}`),
  create:  (data)     => api.post("/clients/icb", data),
  update:  (id, data) => api.put(`/clients/icb/${id}`, data),
  delete:  (id)       => api.delete(`/clients/icb/${id}`),
};

export const federationAPI = {
  getAll:  clientManagementService.getFederations,
  create:  (data)     => api.post("/clients/federation", data),
  update:  (id, data) => api.put(`/clients/federation/${id}`, data),
  delete:  (id)       => api.delete(`/clients/federation/${id}`),
};

export const pcnAPI = {
  getAll:           pcnService.getAll,
  getById:          pcnService.getById,
  getRollup:        pcnService.getRollup,
  create:           pcnService.create,
  update:           pcnService.update,
  delete:           pcnService.delete,
  updateRestricted: pcnService.updateRestricted,
  getMeetings:      pcnService.getMeetings,
  upsertMeeting:    pcnService.upsertMeeting,
};

export const practiceAPI = {
  getAll:              (params)                      => api.get("/clients/practice", { params }),
  getById:             (id)                           => api.get(`/clients/practice/${id}`),
  create:              (data)                         => api.post("/clients/practice", data),
  update:              (id, data)                     => api.put(`/clients/practice/${id}`, data),
  delete:              (id)                           => api.delete(`/clients/practice/${id}`),
  updateRestricted:    (id, clinicianIds)             => api.patch(`/clients/practice/${id}/restricted`, { clinicianIds }),
  requestSystemAccess: (entityType, entityId, data)  => api.post(`/clients/${entityType}/${entityId}/system-access-request`, data),
};

// ─────────────────────────────────────────────────────────────
// History, Email, Compliance
// ─────────────────────────────────────────────────────────────
export const historyAPI = {
  get:        (entityType, entityId, params) => api.get(`/clients/${entityType}/${entityId}/history`, { params }),
  add:        (entityType, entityId, data)   => api.post(`/clients/${entityType}/${entityId}/history`, data),
  update:     (logId, data)                  => api.put(`/clients/history/${logId}`, data),
  toggleStar: (logId)                        => api.patch(`/clients/history/${logId}/star`),
  delete:     (logId)                        => api.delete(`/clients/history/${logId}`),
};

export const emailAPI = {
  sendMass: (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};

export const complianceAPI = {
  getStatus:      (entityType, entityId)                => api.get(`/clients/${entityType}/${entityId}/compliance/status`),
  upsertDoc:      (entityType, entityId, docKey, data)  =>
    api.patch(`/clients/${entityType}/${entityId}/compliance/${docKey}`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),
  approveDoc:     (entityType, entityId, docKey)        => api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/approve`),
  rejectDoc:      (entityType, entityId, docKey, reason) =>
    api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/reject`, { reason }),
  getExpiring:    (days = 30) => api.get("/clients/compliance/expiring", { params: { days } }),
  runExpiryCheck: ()          => api.post("/clients/compliance/run-expiry"),
};

export const complianceDocsAPI = {
  getAll:   (params)   => api.get("/compliance/documents", { params }),
  getStats: ()         => api.get("/compliance/documents/stats"),
  getById:  (id)       => api.get(`/compliance/documents/${id}`),
  create:   (data)     => api.post("/compliance/documents", data),
  update:   (id, data) => api.put(`/compliance/documents/${id}`, data),
  delete:   (id)       => api.delete(`/compliance/documents/${id}`),
};

export const documentGroupsAPI = {
  getAll:       (params)     => api.get("/compliance/groups", { params }),
  getForEntity: (entityType) => api.get(`/compliance/groups/for-entity/${entityType}`),
  getById:      (id)         => api.get(`/compliance/groups/${id}`),
  create:       (data)       => api.post("/compliance/groups", data),
  update:       (id, data)   => api.put(`/compliance/groups/${id}`, data),
  delete:       (id)         => api.delete(`/compliance/groups/${id}`),
  duplicate:    (id, data)   => api.post(`/compliance/groups/${id}/duplicate`, data),
};

export const entityDocumentsAPI = {
  getAll: (entityType, entityId) =>
    api.get(`/clients/${entityType}/${entityId}/documents`),

  update: (entityType, entityId, documentId, data) =>
    api.patch(`/clients/${entityType}/${entityId}/documents/${documentId}`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),

  addUploads: (entityType, entityId, groupId, documentId, data) =>
    api.post(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),

  updateUpload: (entityType, entityId, groupId, documentId, uploadId, data) =>
    api.patch(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads/${uploadId}`, data),

  deleteUpload: (entityType, entityId, groupId, documentId, uploadId) =>
    api.delete(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads/${uploadId}`),
};

export const reportingArchiveAPI = {
  getAll: (entityType, entityId) =>
    api.get(`/clients/${entityType}/${entityId}/reporting-archive`),

  add: (entityType, entityId, jsonPayload) =>
    api.post(`/clients/${entityType}/${entityId}/reporting-archive`, jsonPayload),

  delete: (entityType, entityId, reportId) =>
    api.delete(`/clients/${entityType}/${entityId}/reporting-archive/${reportId}`),
};

// ─────────────────────────────────────────────────────────────
// Clinician Management + Restricted Clinicians
// ─────────────────────────────────────────────────────────────
export const clinicianAPI = {
  /* List + CRUD */
  getAll: (params) => api.get("/clinicians", { params }),           // assuming clinicianService use karta hai to adjust kar sakte ho
  getById: (id) => api.get(`/clinicians/${id}`),
  create: (data) => api.post("/clinicians", data),
  update: (id, data) => api.put(`/clinicians/${id}`, data),
  delete: (id) => api.delete(`/clinicians/${id}`),

  /* Tab 9 — Scope of practice */
  getScope: (id) => api.get(`/clinicians/${id}/scope`),
  updateScope: (id, data) => api.put(`/clinicians/${id}/scope`, data),

  /* Tab 9 — Per-client restrictions */
  getRestrictedClients: (id) => api.get(`/clinicians/${id}/restricted-clients`),
  addRestrictedClient: (id, data) => api.post(`/clinicians/${id}/restricted-clients`, data),
  removeRestrictedClient: (id, recordId) => api.delete(`/clinicians/${id}/restricted-clients/${recordId}`),
};

/* ── Restricted Clinicians (System-wide & Rota lookup) ── */
export const restrictedClinicianAPI = {
  // Global list with filters (?entityType=practice&entityId=xxx)
  getAll: (params) => api.get("/restricted-clinicians", { params }),

  // Rota/Booking lookup: "Which clinicians are restricted at this client?"
  getAtClient: (entityType, entityId) =>
    api.get(`/restricted-clinicians/${entityType}/${entityId}`),
};

// Default Export
export default {
  ...authAPI,
  ...auditAPI,
  ...hierarchyAPI,
  ...icbAPI,
  ...federationAPI,
  ...pcnAPI,
  ...practiceAPI,
  ...historyAPI,
  ...emailAPI,
  ...complianceAPI,
  ...complianceDocsAPI,
  ...documentGroupsAPI,
  ...entityDocumentsAPI,
  ...reportingArchiveAPI,
  ...clinicianAPI,               // ← Added
  ...restrictedClinicianAPI,     // ← Added
};