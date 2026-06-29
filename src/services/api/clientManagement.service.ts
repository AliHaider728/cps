import apiClient from "./client";
import { AxiosResponse } from "axios";

/* ══════════════════════════════════════════════════════════════════
   HIERARCHY / SEARCH / ICB / FEDERATION
══════════════════════════════════════════════════════════════════ */
export const clientManagementService = {
  getHierarchy:    (): Promise<AxiosResponse> => apiClient.get("/clients/hierarchy"),
  search:          (q: string): Promise<AxiosResponse> => apiClient.get("/clients/search", { params: { q } }),
  getICBs:         (): Promise<AxiosResponse> => apiClient.get("/clients/icb"),
  getICBById:      (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/icb/${id}`),
  createICB:       (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post("/clients/icb", data),
  updateICB:       (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/icb/${id}`, data),
  deleteICB:       (id: string | number): Promise<AxiosResponse> => apiClient.delete(`/clients/icb/${id}`),

  getFederations:  (icbId?: string | number): Promise<AxiosResponse> => apiClient.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
  createFederation:(data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post("/clients/federation", data),
  updateFederation:(id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/federation/${id}`, data),
  deleteFederation:(id: string | number): Promise<AxiosResponse> => apiClient.delete(`/clients/federation/${id}`),
};

/* ══════════════════════════════════════════════════════════════════
   PCN
══════════════════════════════════════════════════════════════════ */
export const pcnService = {
  getAll:  (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get("/clients/pcn", { params }),
  getById: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}`),
  create:  (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post("/clients/pcn", data),
  update:  (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/pcn/${id}`, data),
  delete:  (id: string | number): Promise<AxiosResponse> => apiClient.delete(`/clients/pcn/${id}`),
  rollup:  (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/rollup`),

  getMeetings:   (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`/clients/pcn/${id}/meetings`, data),

  getClientFacing:    (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/client-facing`),
  updateClientFacing: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/pcn/${id}/client-facing`, data),

  updateRestricted: (id: string | number, clinicianIds: string[] | number[]): Promise<AxiosResponse> =>
    apiClient.put(`/clients/pcn/${id}/restricted`, { clinicianIds }),
};

/* ══════════════════════════════════════════════════════════════════
   PRACTICE
══════════════════════════════════════════════════════════════════ */
export const practiceService = {
  getAll:  (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get("/clients/practice", { params }),
  getById: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/practice/${id}`),
  create:  (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post("/clients/practice", data),
  update:  (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/practice/${id}`, data),
  delete:  (id: string | number): Promise<AxiosResponse> => apiClient.delete(`/clients/practice/${id}`),

  updateRestricted: (id: string | number, clinicianIds: string[] | number[]): Promise<AxiosResponse> =>
    apiClient.put(`/clients/practice/${id}/restricted`, { clinicianIds }),
};

/* ══════════════════════════════════════════════════════════════════
   CONTACT HISTORY
══════════════════════════════════════════════════════════════════ */
export const historyService = {
  get: (entityType: string, entityId: string | number, params: Record<string, unknown> = {}): Promise<AxiosResponse> =>
    apiClient.get(`/clients/${entityType}/${entityId}/history`, { params }),

  add: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/clients/${entityType}/${entityId}/history`, data),

  update: (logId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.put(`/clients/history/${logId}`, data),

  toggleStar: (logId: string | number): Promise<AxiosResponse> =>
    apiClient.patch(`/clients/history/${logId}/star`),

  delete: (logId: string | number): Promise<AxiosResponse> =>
    apiClient.delete(`/clients/history/${logId}`),
};

/* ══════════════════════════════════════════════════════════════════
   DECISION MAKERS
══════════════════════════════════════════════════════════════════ */
export const decisionMakersService = {
  get:    (entityType: string, entityId: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/${entityType}/${entityId}/decision-makers`),
  update: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/${entityType}/${entityId}/decision-makers`, data),
};

/* ══════════════════════════════════════════════════════════════════
   FINANCE CONTACTS
══════════════════════════════════════════════════════════════════ */
export const financeContactsService = {
  get:    (entityType: string, entityId: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/${entityType}/${entityId}/finance-contacts`),
  update: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/${entityType}/${entityId}/finance-contacts`, data),
};

/* ══════════════════════════════════════════════════════════════════
   REPORTING ARCHIVE
══════════════════════════════════════════════════════════════════ */
export const reportingArchiveService = {
  get: (entityType: string, entityId: string | number, params: Record<string, unknown> = {}): Promise<AxiosResponse> =>
    apiClient.get(`/clients/${entityType}/${entityId}/reporting-archive`, { params }),

  add: (entityType: string, entityId: string | number, formData: FormData): Promise<AxiosResponse> =>
    apiClient.post(
      `/clients/${entityType}/${entityId}/reporting-archive`,
      formData
    ),

  delete: (entityType: string, entityId: string | number, reportId: string | number): Promise<AxiosResponse> =>
    apiClient.delete(`/clients/${entityType}/${entityId}/reporting-archive/${reportId}`),
};

/* ══════════════════════════════════════════════════════════════════
   SYSTEM ACCESS + MASS EMAIL
══════════════════════════════════════════════════════════════════ */
export const systemAccessService = {
  request: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/clients/${entityType}/${entityId}/system-access`, data),
};

export const massEmailService = {
  send: (entityType: string, entityId: string | number, data: Record<string, unknown>): Promise<AxiosResponse> =>
    apiClient.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};

export default clientManagementService;
