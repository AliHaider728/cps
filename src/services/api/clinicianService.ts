import apiClient from "./client";
import { AxiosResponse } from "axios";

const base = "/clinicians";

export const clinicianService = {
  /* ── Clinicians ─────────────────────────────────────── */
  getAll:    (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get(base, { params }),
  getById:   (id: string | number): Promise<AxiosResponse>          => apiClient.get(`${base}/${id}`),
  create:    (data: Record<string, unknown>): Promise<AxiosResponse>        => apiClient.post(base, data),
  update:    (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>    => apiClient.put(`${base}/${id}`, data),
  linkUser:  (id: string | number, userId?: string | number | null): Promise<AxiosResponse>  => apiClient.patch(`${base}/${id}/link-user`, { userId: userId || null }),
  delete:    (id: string | number): Promise<AxiosResponse>          => apiClient.delete(`${base}/${id}`),

  /* ── Global restrict flag ───────────────────────────── */
  restrict:   (id: string | number, reason: string): Promise<AxiosResponse> => apiClient.patch(`${base}/${id}/restrict`,   { reason }),
  unrestrict: (id: string | number): Promise<AxiosResponse>         => apiClient.patch(`${base}/${id}/unrestrict`),

  /* ── Tab 3 — Compliance docs (legacy flat list) ─────── */
  getCompliance: (id: string | number): Promise<AxiosResponse> => apiClient.get(`${base}/${id}/compliance`),

  upsertComplianceDoc: (id: string | number, docId: string | number | null, formData: FormData | Record<string, unknown>): Promise<AxiosResponse> => {
    const isForm = typeof FormData !== "undefined" && formData instanceof FormData;
    return apiClient.patch(
      `${base}/${id}/compliance/${docId || "new"}`,
      formData,
      isForm ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
  },

  approveComplianceDoc: (id: string | number, docId: string | number): Promise<AxiosResponse> =>
    apiClient.post(`${base}/${id}/compliance/${docId}/approve`),

  rejectComplianceDoc: (id: string | number, docId: string | number, reason: string): Promise<AxiosResponse> =>
    apiClient.post(`${base}/${id}/compliance/${docId}/reject`, { reason }),

  /* ── Tab 3 — Compliance Groups ──────────────────────── */
  getClinicianComplianceGroups: (id: string | number): Promise<AxiosResponse> =>
    apiClient.get(`${base}/${id}/compliance-groups`),

  assignComplianceGroups: (id: string | number, groupIds: (string | number)[]): Promise<AxiosResponse> =>
    apiClient.put(`${base}/${id}/compliance-groups`, { groupIds }),

  /* ── Tab 4 — Client history ─────────────────────────── */
  getClientHistory: (id: string | number): Promise<AxiosResponse> => apiClient.get(`${base}/${id}/client-history`),

  /* ── Tab 5 — Leave ──────────────────────────────────── */
  getMyLeave:  (): Promise<AxiosResponse>                => apiClient.get(`${base}/me/leave`),
  getLeave:    (id: string | number): Promise<AxiosResponse>              => apiClient.get(`${base}/${id}/leave`),
  updateUserLogin: (id: string | number, email: string): Promise<AxiosResponse>   => apiClient.patch(`${base}/${id}/user-login`, { email }),
  resetUserPassword: (id: string | number): Promise<AxiosResponse>        => apiClient.post(`${base}/${id}/reset-login-password`),
  getProjectMappings: (id: string | number): Promise<AxiosResponse>       => apiClient.get(`${base}/${id}/project-mappings`),
  createProjectMapping: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`${base}/${id}/project-mappings`, data),
  deleteProjectMapping: (id: string | number, mappingId: string | number): Promise<AxiosResponse> =>
    apiClient.delete(`${base}/${id}/project-mappings/${mappingId}`),
  addLeave:    (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>        => apiClient.post(`${base}/${id}/leave`, data),
  updateLeave: (id: string | number, entryId: string | number, d: Record<string, unknown>): Promise<AxiosResponse>  => apiClient.put(`${base}/${id}/leave/${entryId}`, d),
  deleteLeave: (id: string | number, entryId: string | number): Promise<AxiosResponse>     => apiClient.delete(`${base}/${id}/leave/${entryId}`),

  /* ── Tab 6 — Supervision ────────────────────────────── */
  getSupervision:    (id: string | number): Promise<AxiosResponse>            => apiClient.get(`${base}/${id}/supervision`),
  addSupervision:    (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>      => apiClient.post(`${base}/${id}/supervision`, data),
  updateSupervision: (id: string | number, logId: string | number, d: Record<string, unknown>): Promise<AxiosResponse>  => apiClient.put(`${base}/${id}/supervision/${logId}`, d),
  deleteSupervision: (id: string | number, logId: string | number): Promise<AxiosResponse>     => apiClient.delete(`${base}/${id}/supervision/${logId}`),

  /* ── Tab 7 — CPPE ───────────────────────────────────── */
  getCPPE:    (id: string | number): Promise<AxiosResponse>        => apiClient.get(`${base}/${id}/cppe`),
  updateCPPE: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>  => apiClient.put(`${base}/${id}/cppe`, data),

  /* ── Tab 8 — Onboarding ─────────────────────────────── */
  updateOnboarding: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`${base}/${id}/onboarding`, data),
  sendWelcomePack:  (id: string | number, data?: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`${base}/${id}/onboarding/welcome`, data || {}),
  
  /* ── Tab 9 — Scope of practice ──────────────────────── */
  getScope:    (id: string | number): Promise<AxiosResponse>        => apiClient.get(`${base}/${id}/scope`),
  updateScope: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>  => apiClient.put(`${base}/${id}/scope`, data),

  /* ── Tab 9 — Per-client restrictions ────────────────── */
  getRestrictedClients:   (id: string | number): Promise<AxiosResponse>           => apiClient.get(`${base}/${id}/restricted-clients`),
  addRestrictedClient:    (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse>     => apiClient.post(`${base}/${id}/restricted-clients`, data),
  removeRestrictedClient: (id: string | number, recordId: string | number): Promise<AxiosResponse> => apiClient.delete(`${base}/${id}/restricted-clients/${recordId}`),
};

export default clinicianService;
