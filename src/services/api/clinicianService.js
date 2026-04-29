/**
 * services/api/clinicianService.js — Module 3  (COMPLETE — replace existing)
 *
 * All Clinician Management API calls.
 * Adds scope + restricted-client methods that were missing.
 */

import { apiClient } from "./client";

const base = "/clinicians";

export const clinicianService = {
  /* ── Clinicians ─────────────────────────────────────── */
  getAll:    (params = {}) => apiClient.get(base, { params }),
  getById:   (id)          => apiClient.get(`${base}/${id}`),
  create:    (data)        => apiClient.post(base, data),
  update:    (id, data)    => apiClient.put(`${base}/${id}`, data),
  delete:    (id)          => apiClient.delete(`${base}/${id}`),

  /* ── Global restrict flag ───────────────────────────── */
  restrict:   (id, reason) => apiClient.patch(`${base}/${id}/restrict`,   { reason }),
  unrestrict: (id)         => apiClient.patch(`${base}/${id}/unrestrict`),

  /* ── Tab 3 — Compliance docs ────────────────────────── */
  getCompliance: (id) => apiClient.get(`${base}/${id}/compliance`),

  upsertComplianceDoc: (id, docId, formData) => {
    const isForm = typeof FormData !== "undefined" && formData instanceof FormData;
    return apiClient.patch(
      `${base}/${id}/compliance/${docId || "new"}`,
      formData,
      isForm ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
  },

  approveComplianceDoc: (id, docId) =>
    apiClient.post(`${base}/${id}/compliance/${docId}/approve`),

  rejectComplianceDoc: (id, docId, reason) =>
    apiClient.post(`${base}/${id}/compliance/${docId}/reject`, { reason }),

  /* ── Tab 4 — Client history ─────────────────────────── */
  getClientHistory: (id) => apiClient.get(`${base}/${id}/client-history`),

  /* ── Tab 5 — Leave ──────────────────────────────────── */
  getLeave:    (id)              => apiClient.get(`${base}/${id}/leave`),
  addLeave:    (id, data)        => apiClient.post(`${base}/${id}/leave`, data),
  updateLeave: (id, entryId, d)  => apiClient.put(`${base}/${id}/leave/${entryId}`, d),
  deleteLeave: (id, entryId)     => apiClient.delete(`${base}/${id}/leave/${entryId}`),

  /* ── Tab 6 — Supervision ────────────────────────────── */
  getSupervision:    (id)            => apiClient.get(`${base}/${id}/supervision`),
  addSupervision:    (id, data)      => apiClient.post(`${base}/${id}/supervision`, data),
  updateSupervision: (id, logId, d)  => apiClient.put(`${base}/${id}/supervision/${logId}`, d),
  deleteSupervision: (id, logId)     => apiClient.delete(`${base}/${id}/supervision/${logId}`),

  /* ── Tab 7 — CPPE ───────────────────────────────────── */
  getCPPE:    (id)        => apiClient.get(`${base}/${id}/cppe`),
  updateCPPE: (id, data)  => apiClient.put(`${base}/${id}/cppe`, data),

  /* ── Tab 8 — Onboarding ─────────────────────────────── */
  updateOnboarding: (id, data) => apiClient.put(`${base}/${id}/onboarding`, data),
  sendWelcomePack:  (id, data) => apiClient.post(`${base}/${id}/onboarding/welcome`, data || {}),

  /* ── Tab 9 — Scope of practice ──────────────────────── */  // ← NEW
  getScope:    (id)        => apiClient.get(`${base}/${id}/scope`),
  updateScope: (id, data)  => apiClient.put(`${base}/${id}/scope`, data),

  /* ── Tab 9 — Per-client restrictions ────────────────── */  // ← NEW
  getRestrictedClients:   (id)           => apiClient.get(`${base}/${id}/restricted-clients`),
  addRestrictedClient:    (id, data)     => apiClient.post(`${base}/${id}/restricted-clients`, data),
  removeRestrictedClient: (id, recordId) => apiClient.delete(`${base}/${id}/restricted-clients/${recordId}`),
};

export default clinicianService;