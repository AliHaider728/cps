import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://cps-backend-ten.vercel.app/api");

export const storage = {
  getToken: () => localStorage.getItem("cps_token"),
  getUser: () => {
    try {
      const raw = localStorage.getItem("cps_user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("cps_user");
      return null;
    }
  },
  setSession: ({ token, user }) => {
    if (token) localStorage.setItem("cps_token", token);
    if (user) localStorage.setItem("cps_user", JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem("cps_token");
    localStorage.removeItem("cps_user");
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function normalizeApiError(error) {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  if (status === 503) {
    error.message = "Server unavailable";
    error.response.data = {
      ...(error.response?.data || {}),
      message: "Server unavailable",
    };
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

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
