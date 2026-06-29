import { authService, clientManagementService, pcnService, apiClient } from "../services/api";
import { timeEntryService } from "../services/api/timeEntryService";
import { AxiosResponse, AxiosRequestConfig } from "axios";

const api = apiClient;

// ─────────────────────────────────────────────────────────────
// Auth & Audit
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  login:           authService.login,
  logout:          authService.logout,
  getMe:           authService.getMe,
  changePassword:  authService.changePassword,
  getAllUsers:     (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get("/auth/users", { params }),
  getUserById:     (id: string | number): Promise<AxiosResponse>     => api.get(`/auth/users/${id}`),
  createUser:      authService.createUser,
  updateUser:      authService.updateUser,
  deleteUser:      authService.deleteUser,
  anonymiseUser:   authService.anonymiseUser,
};

export const auditAPI = {
  getLogs: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get("/audit", { params }),
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
  getById: (id: string | number): Promise<AxiosResponse>       => api.get(`/clients/icb/${id}`),
  create:  (data: Record<string, unknown>): Promise<AxiosResponse>     => api.post("/clients/icb", data),
  update:  (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/clients/icb/${id}`, data),
  delete:  (id: string | number): Promise<AxiosResponse>       => api.delete(`/clients/icb/${id}`),
};

export const federationAPI = {
  getAll:  clientManagementService.getFederations,
  create:  (data: Record<string, unknown>): Promise<AxiosResponse>     => api.post("/clients/federation", data),
  update:  (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/clients/federation/${id}`, data),
  delete:  (id: string | number): Promise<AxiosResponse>       => api.delete(`/clients/federation/${id}`),
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
  getAll:              (params?: Record<string, unknown>): Promise<AxiosResponse>                      => api.get("/clients/practice", { params }),
  getById:             (id: string | number): Promise<AxiosResponse>                           => api.get(`/clients/practice/${id}`),
  create:              (data: Record<string, unknown>): Promise<AxiosResponse>                         => api.post("/clients/practice", data),
  update:              (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>                     => api.put(`/clients/practice/${id}`, data),
  delete:              (id: string | number): Promise<AxiosResponse>                           => api.delete(`/clients/practice/${id}`),
  updateRestricted:    (id: string | number, clinicianIds: string[] | number[]): Promise<AxiosResponse>             => api.patch(`/clients/practice/${id}/restricted`, { clinicianIds }),
  requestSystemAccess: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse>  => api.post(`/clients/${entityType}/${entityId}/system-access-request`, data),
};

// ─────────────────────────────────────────────────────────────
// History, Email, Compliance
// ─────────────────────────────────────────────────────────────
export const historyAPI = {
  get:        (entityType: string, entityId: string | number, params?: Record<string, unknown>): Promise<AxiosResponse> => api.get(`/clients/${entityType}/${entityId}/history`, { params }),
  add:        (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse>   => api.post(`/clients/${entityType}/${entityId}/history`, data),
  update:     (logId: string | number, data: Record<string, unknown>): Promise<AxiosResponse>                  => api.put(`/clients/history/${logId}`, data),
  toggleStar: (logId: string | number): Promise<AxiosResponse>                        => api.patch(`/clients/history/${logId}/star`),
  delete:     (logId: string | number): Promise<AxiosResponse>                        => api.delete(`/clients/history/${logId}`),
};

export const emailAPI = {
  sendMass: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    api.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};

export const complianceAPI = {
  getStatus:      (entityType: string, entityId: string | number): Promise<AxiosResponse>                => api.get(`/clients/${entityType}/${entityId}/compliance/status`),
  upsertDoc:      (entityType: string, entityId: string | number, docKey: string, data: Record<string, unknown> | FormData): Promise<AxiosResponse>  =>
    api.patch(`/clients/${entityType}/${entityId}/compliance/${docKey}`, data, {
      headers: typeof FormData !== "undefined" && data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),
  approveDoc:     (entityType: string, entityId: string | number, docKey: string): Promise<AxiosResponse>        => api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/approve`),
  rejectDoc:      (entityType: string, entityId: string | number, docKey: string, reason: string): Promise<AxiosResponse> =>
    api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/reject`, { reason }),
  getExpiring:    (days: number = 30): Promise<AxiosResponse> => api.get("/clients/compliance/expiring", { params: { days } }),
  runExpiryCheck: (): Promise<AxiosResponse>          => api.post("/clients/compliance/run-expiry"),
};

export const complianceDocsAPI = {
  getAll:   (params?: Record<string, unknown>): Promise<AxiosResponse>   => api.get("/compliance/documents", { params }),
  getStats: (): Promise<AxiosResponse>         => api.get("/compliance/documents/stats"),
  getById:  (id: string | number): Promise<AxiosResponse>       => api.get(`/compliance/documents/${id}`),
  create:   (data: Record<string, unknown>): Promise<AxiosResponse>     => api.post("/compliance/documents", data),
  update:   (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/compliance/documents/${id}`, data),
  delete:   (id: string | number): Promise<AxiosResponse>       => api.delete(`/compliance/documents/${id}`),
};

export const documentGroupsAPI = {
  getAll:       (params?: Record<string, unknown>): Promise<AxiosResponse>     => api.get("/compliance/groups", { params }),
  getForEntity: (entityType: string): Promise<AxiosResponse> => api.get(`/compliance/groups/for-entity/${entityType}`),
  getById:      (id: string | number): Promise<AxiosResponse>         => api.get(`/compliance/groups/${id}`),
  create:       (data: Record<string, unknown>): Promise<AxiosResponse>       => api.post("/compliance/groups", data),
  update:       (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>   => api.put(`/compliance/groups/${id}`, data),
  delete:       (id: string | number): Promise<AxiosResponse>         => api.delete(`/compliance/groups/${id}`),
  duplicate:    (id: string | number, data?: Record<string, unknown>): Promise<AxiosResponse>   => api.post(`/compliance/groups/${id}/duplicate`, data),
};

export const entityDocumentsAPI = {
  getAll: (entityType: string, entityId: string | number): Promise<AxiosResponse> =>
    api.get(`/clients/${entityType}/${entityId}/documents`),

  update: (entityType: string, entityId: string | number, documentId: string | number, data: Record<string, unknown> | FormData): Promise<AxiosResponse> =>
    api.patch(`/clients/${entityType}/${entityId}/documents/${documentId}`, data, {
      headers: typeof FormData !== "undefined" && data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),

  addUploads: (entityType: string, entityId: string | number, groupId: string | number, documentId: string | number, data: Record<string, unknown> | FormData): Promise<AxiosResponse> =>
    api.post(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads`, data, {
      headers: typeof FormData !== "undefined" && data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    }),

  updateUpload: (entityType: string, entityId: string | number, groupId: string | number, documentId: string | number, uploadId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    api.patch(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads/${uploadId}`, data),

  deleteUpload: (entityType: string, entityId: string | number, groupId: string | number, documentId: string | number, uploadId: string | number): Promise<AxiosResponse> =>
    api.delete(`/clients/${entityType}/${entityId}/documents/${groupId}/${documentId}/uploads/${uploadId}`),
};

export const reportingArchiveAPI = {
  getAll: (entityType: string, entityId: string | number): Promise<AxiosResponse> =>
    api.get(`/clients/${entityType}/${entityId}/reporting-archive`),

  add: (entityType: string, entityId: string | number, jsonPayload: Record<string, unknown>): Promise<AxiosResponse> =>
    api.post(`/clients/${entityType}/${entityId}/reporting-archive`, jsonPayload),

  delete: (entityType: string, entityId: string | number, reportId: string | number): Promise<AxiosResponse> =>
    api.delete(`/clients/${entityType}/${entityId}/reporting-archive/${reportId}`),
};

// ─────────────────────────────────────────────────────────────
// Clinician Management + Restricted Clinicians
// ─────────────────────────────────────────────────────────────
export const clinicianAPI = {
  /* List + CRUD */
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get("/clinicians", { params }),
  getById: (id: string | number): Promise<AxiosResponse> => api.get(`/clinicians/${id}`),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post("/clinicians", data),
  update: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/clinicians/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse> => api.delete(`/clinicians/${id}`),

  /* Tab 9 — Scope of practice */
  getScope: (id: string | number): Promise<AxiosResponse> => api.get(`/clinicians/${id}/scope`),
  updateScope: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/clinicians/${id}/scope`, data),

  /* Tab 9 — Per-client restrictions */
  getRestrictedClients: (id: string | number): Promise<AxiosResponse> => api.get(`/clinicians/${id}/restricted-clients`),
  addRestrictedClient: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => api.post(`/clinicians/${id}/restricted-clients`, data),
  removeRestrictedClient: (id: string | number, recordId: string | number): Promise<AxiosResponse> => api.delete(`/clinicians/${id}/restricted-clients/${recordId}`),
};

/* ── Restricted Clinicians (System-wide & Rota lookup) ── */
export const restrictedClinicianAPI = {
  // Global list with filters (?entityType=practice&entityId=xxx)
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get("/restricted-clinicians", { params }),

  // Rota/Booking lookup: "Which clinicians are restricted at this client?"
  getAtClient: (entityType: string, entityId: string | number): Promise<AxiosResponse> =>
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
  ...clinicianAPI,
  ...restrictedClinicianAPI,
};

// ─────────────────────────────────────────────────────────────
// Time Entries (Clock-In / Clock-Out)
// ─────────────────────────────────────────────────────────────
export const timeEntryAPI = {
  clockIn:          (data?: Record<string, unknown>)        => timeEntryService.clockIn(data),
  clockOut:         ()            => timeEntryService.clockOut(),
  getActive:        (params?: Record<string, unknown>)      => timeEntryService.getActive(params),
  list:             (params?: Record<string, unknown>)      => timeEntryService.list(params),
  getAdminSummary:  ()            => timeEntryService.getAdminSummary(),
};
