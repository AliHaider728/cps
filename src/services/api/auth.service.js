import apiClient from "./client";

export const authService = {
  login: (email, password) => apiClient.post("/auth/login", { email, password }),
  logout: () => apiClient.post("/auth/logout"),
  getMe: () => apiClient.get("/auth/me"),
  changePassword: (newPassword, config = undefined) =>
    apiClient.put("/auth/change-password", { newPassword }, config),
  getAllUsers: () => apiClient.get("/auth/users"),
  createUser: (data) => apiClient.post("/auth/users", data),
  updateUser: (id, data) => apiClient.put(`/auth/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/auth/users/${id}`),
  anonymiseUser: (id) => apiClient.post(`/auth/users/${id}/gdpr`),
};

export default authService;
