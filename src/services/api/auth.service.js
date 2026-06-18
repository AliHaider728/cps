import apiClient from "./client";

export const authService = {
  login: (email, password, recaptchaToken) =>
    apiClient.post("/auth/login", { email, password, recaptchaToken }),

  logout: () => apiClient.post("/auth/logout"),

  getMe: () => apiClient.get("/auth/me"),

  changePassword: (newPassword, config = undefined) =>
    apiClient.put("/auth/change-password", { newPassword }, config),

  getAllUsers: () => apiClient.get("/auth/users"),

  getUserById: (id) => apiClient.get(`/auth/users/${id}`),

  createUser: (data) => apiClient.post("/auth/users", data),

  updateUser: (id, data) => apiClient.put(`/auth/users/${id}`, data),

  deleteUser: (id) => apiClient.delete(`/auth/users/${id}`),

  anonymiseUser: (id) => apiClient.post(`/auth/users/${id}/gdpr`),

  adminChangeUserPassword: (id, password) =>
    apiClient.put(`/auth/users/${id}/password`, { password }),
};

export default authService;