import apiClient from "./client";
import { AxiosResponse, AxiosRequestConfig } from "axios";

export interface AuthLoginResponse {
  token: string;
  user: Record<string, unknown>;
}

export interface UserData {
  id?: string;
  email?: string;
  [key: string]: unknown;
}

export const authService = {
  login: (email: string, password: string, recaptchaToken?: string): Promise<AxiosResponse<AuthLoginResponse>> =>
    apiClient.post("/auth/login", { email, password, recaptchaToken }),

  logout: (): Promise<AxiosResponse<void>> => apiClient.post("/auth/logout"),

  getMe: (): Promise<AxiosResponse<UserData>> => apiClient.get("/auth/me"),

  changePassword: (newPassword: string, config?: AxiosRequestConfig): Promise<AxiosResponse<void>> =>
    apiClient.put("/auth/change-password", { newPassword }, config),

  getAllUsers: (): Promise<AxiosResponse<UserData[]>> => apiClient.get("/auth/users"),

  getUserById: (id: string | number): Promise<AxiosResponse<UserData>> => apiClient.get(`/auth/users/${id}`),

  createUser: (data: Partial<UserData>): Promise<AxiosResponse<UserData>> => apiClient.post("/auth/users", data),

  updateUser: (id: string | number, data: Partial<UserData>): Promise<AxiosResponse<UserData>> => apiClient.put(`/auth/users/${id}`, data),

  deleteUser: (id: string | number): Promise<AxiosResponse<void>> => apiClient.delete(`/auth/users/${id}`),

  anonymiseUser: (id: string | number): Promise<AxiosResponse<void>> => apiClient.post(`/auth/users/${id}/gdpr`),

  adminChangeUserPassword: (id: string | number, password: string): Promise<AxiosResponse<void>> =>
    apiClient.put(`/auth/users/${id}/password`, { password }),
};

export default authService;
