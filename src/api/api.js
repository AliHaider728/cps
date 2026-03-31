import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cps-backend-ten.vercel.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cps_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const auditAPI = {
  getLogs: (params) => api.get("/audit", { params }),
};

export const hierarchyAPI = {
  getHierarchy: ()  => api.get("/clients/hierarchy"),
  search:       (q) => api.get("/clients/search", { params: { q } }),
};

export const icbAPI = {
  getAll:  ()         => api.get("/clients/icb"),
  getById: (id)       => api.get(`/clients/icb/${id}`),
  create:  (data)     => api.post("/clients/icb", data),
  update:  (id, data) => api.put(`/clients/icb/${id}`, data),
  delete:  (id)       => api.delete(`/clients/icb/${id}`),
};

export const federationAPI = {
  getAll:  (icbId)    => api.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
  create:  (data)     => api.post("/clients/federation", data),
  update:  (id, data) => api.put(`/clients/federation/${id}`, data),
  delete:  (id)       => api.delete(`/clients/federation/${id}`),
};

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

export const practiceAPI = {
  getAll:   (params)    => api.get("/clients/practice", { params }),
  getById:  (id)        => api.get(`/clients/practice/${id}`),
  create:   (data)      => api.post("/clients/practice", data),
  update:   (id, data)  => api.put(`/clients/practice/${id}`, data),
  delete:   (id)        => api.delete(`/clients/practice/${id}`),
  updateRestricted: (id, clinicianIds) =>
    api.patch(`/clients/practice/${id}/restricted`, { clinicianIds }),
  requestSystemAccess: (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/system-access-request`, data),
};

export const historyAPI = {
  get:        (entityType, entityId, params) =>
    api.get(`/clients/${entityType}/${entityId}/history`, { params }),
  add:        (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/history`, data),
  update:     (logId, data) => api.put(`/clients/history/${logId}`, data),
  toggleStar: (logId)       => api.patch(`/clients/history/${logId}/star`),
  delete:     (logId)       => api.delete(`/clients/history/${logId}`),
};

export const emailAPI = {
  sendMass: (entityType, entityId, data) =>
    api.post(`/clients/${entityType}/${entityId}/mass-email`, data),
};

export default api;