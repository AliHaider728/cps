// src/api/api.js
//  FINAL UNIFIED API FILE
//  Dono files merge — axios + saare endpoints + compliance docs
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cps-backend-ten.vercel.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Har request mein token auto-attach
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cps_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── 401 aaye toh auto logout + redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cps_token");
      localStorage.removeItem("cps_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);


//  AUTH

export const authAPI = {
  login:          (email, password) => api.post("/auth/login", { email, password }),
  logout:         ()                => api.post("/auth/logout"),
  getMe:          ()                => api.get("/auth/me"),
  changePassword: (newPassword)     => api.put("/auth/change-password", { newPassword }),
  getAllUsers:     ()                => api.get("/auth/users"),
  createUser:     (data)            => api.post("/auth/users", data),
  updateUser:     (id, data)        => api.put(`/auth/users/${id}`, data),
  deleteUser:     (id)              => api.delete(`/auth/users/${id}`),
  anonymiseUser:  (id)              => api.post(`/auth/users/${id}/gdpr`),
};


//  AUDIT

export const auditAPI = {
  getLogs: (params) => api.get("/audit", { params }),
};


//  HIERARCHY

export const hierarchyAPI = {
  getHierarchy: ()  => api.get("/clients/hierarchy"),
  search:       (q) => api.get("/clients/search", { params: { q } }),
};


//  ICB

export const icbAPI = {
  getAll:  ()         => api.get("/clients/icb"),
  getById: (id)       => api.get(`/clients/icb/${id}`),
  create:  (data)     => api.post("/clients/icb", data),
  update:  (id, data) => api.put(`/clients/icb/${id}`, data),
  delete:  (id)       => api.delete(`/clients/icb/${id}`),
};


//  FEDERATION

export const federationAPI = {
  getAll:  (icbId)    => api.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
  create:  (data)     => api.post("/clients/federation", data),
  update:  (id, data) => api.put(`/clients/federation/${id}`, data),
  delete:  (id)       => api.delete(`/clients/federation/${id}`),
};


//  PCN

export const pcnAPI = {
  getAll:    (params)   => api.get("/clients/pcn", { params }),
  getById:   (id)       => api.get(`/clients/pcn/${id}`),
  getRollup: (id)       => api.get(`/clients/pcn/${id}/rollup`),
  create:    (data)     => api.post("/clients/pcn", data),
  update:    (id, data) => api.put(`/clients/pcn/${id}`, data),
  delete:    (id)       => api.delete(`/clients/pcn/${id}`),
  updateRestricted: (id, clinicianIds) =>
    api.patch(`/clients/pcn/${id}/restricted`, { clinicianIds }),
  getMeetings:   (id)       => api.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting: (id, data) => api.post(`/clients/pcn/${id}/meetings`, data),
};


//  PRACTICE

export const practiceAPI = {
  getAll:   (params)   => api.get("/clients/practice", { params }),
  getById:  (id)       => api.get(`/clients/practice/${id}`),
  create:   (data)     => api.post("/clients/practice", data),
  update:   (id, data) => api.put(`/clients/practice/${id}`, data),
  delete:   (id)       => api.delete(`/clients/practice/${id}`),
  updateRestricted: (id, clinicianIds) =>
    api.patch(`/clients/practice/${id}/restricted`, { clinicianIds }),
  requestSystemAccess: (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/system-access-request`, data),
};


//  CONTACT HISTORY

export const historyAPI = {
  get:        (entityType, entityId, params) =>
    api.get(`/clients/${entityType}/${entityId}/history`, { params }),
  add:        (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/history`, data),
  update:     (logId, data) => api.put(`/clients/history/${logId}`, data),
  toggleStar: (logId)       => api.patch(`/clients/history/${logId}/star`),
  delete:     (logId)       => api.delete(`/clients/history/${logId}`),
};


//  MASS EMAIL

export const emailAPI = {
  sendMass: (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};


//  COMPLIANCE — Entity Level
//  Kisi ICB / PCN / Practice ki compliance check

export const complianceAPI = {
  getStatus: (entityType, entityId) =>
    api.get(`/clients/${entityType}/${entityId}/compliance/status`),

  upsertDoc: (entityType, entityId, docKey, data) =>
    api.patch(`/clients/${entityType}/${entityId}/compliance/${docKey}`, data),

  approveDoc: (entityType, entityId, docKey) =>
    api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/approve`),

  rejectDoc: (entityType, entityId, docKey, reason) =>
    api.post(`/clients/${entityType}/${entityId}/compliance/${docKey}/reject`, { reason }),

  getExpiring: (days = 30) =>
    api.get("/clients/compliance/expiring", { params: { days } }),

  runExpiryCheck: () =>
    api.post("/clients/compliance/run-expiry"),
};


//  COMPLIANCE DOCUMENTS — Document Library CRUD
//  Master list of compliance documents

export const complianceDocsAPI = {
  getAll:  (params)   => api.get("/compliance/documents", { params }),
  getById: (id)       => api.get(`/compliance/documents/${id}`),
  create:  (data)     => api.post("/compliance/documents", data),
  update:  (id, data) => api.put(`/compliance/documents/${id}`, data),
  delete:  (id)       => api.delete(`/compliance/documents/${id}`),
};


//  DOCUMENT GROUPS
//  Compliance docs ko groups mein organize karna

export const documentGroupsAPI = {
  getAll:  (params)   => api.get("/compliance/groups", { params }),
  getById: (id)       => api.get(`/compliance/groups/${id}`),
  create:  (data)     => api.post("/compliance/groups", data),
  update:  (id, data) => api.put(`/compliance/groups/${id}`, data),
  delete:  (id)       => api.delete(`/compliance/groups/${id}`),
};

export const entityDocumentsAPI = {
  getAll: (entityType, entityId) =>
    api.get(`/clients/${entityType}/${entityId}/documents`),
  update: (entityType, entityId, documentId, data) =>
    api.patch(`/clients/${entityType}/${entityId}/documents/${documentId}`, data),
};

export default api;
