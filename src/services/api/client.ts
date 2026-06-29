import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://cps-backend-ten.vercel.app/api");

export interface SessionData {
  token?: string | null;
  user?: Record<string, unknown> | null;
}

export const storage = {
  getToken: (): string | null => localStorage.getItem("cps_token"),
  getUser: (): Record<string, unknown> | null => {
    try {
      const raw = localStorage.getItem("cps_user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("cps_user");
      return null;
    }
  },
  setSession: ({ token, user }: SessionData): void => {
    if (token) localStorage.setItem("cps_token", token);
    if (user) localStorage.setItem("cps_user", JSON.stringify(user));
  },
  clearSession: (): void => {
    localStorage.removeItem("cps_token");
    localStorage.removeItem("cps_user");
  },
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function normalizeApiError(error: AxiosError | any): AxiosError | Error {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 503) {
    error.message = "Server unavailable";
    if (error.response && error.response.data) {
      error.response.data = {
        ...(error.response.data as Record<string, unknown>),
        message: "Server unavailable",
      };
    }
    return error;
  }

  if (!error.response) {
    error.message = "Server unavailable";
    return error;
  }

  if (serverMessage) {
    error.message = serverMessage;
  }

  return error;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError | any) => {
    normalizeApiError(error);

    if (error.response?.status === 401) {
      storage.clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
