import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

// ── Axios interceptor: attach token to every request ─────────────
// Single interceptor here — ClientsModule does NOT need its own
if (!axios._cpsAuthInterceptorSet) {
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("cps_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axios.interceptors.response.use(
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
  axios._cpsAuthInterceptorSet = true;
}

const setAxiosToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem("cps_user");
    const token = localStorage.getItem("cps_token");
    if (saved && token) {
      setAxiosToken(token);
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // ── Login
  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user: u } = data;

    setAxiosToken(token);
    localStorage.setItem("cps_token", token);
    localStorage.setItem("cps_user",  JSON.stringify(u));
    setUser(u);

    return {
      token,
      redirectTo:         u.redirectTo,
      mustChangePassword: u.mustChangePassword ?? false,
    };
  }, []);

  // ── Logout
  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch {
      // ignore — local logout always proceeds
    }
    setAxiosToken(null);
    localStorage.removeItem("cps_token");
    localStorage.removeItem("cps_user");
    setUser(null);
  }, []);

  // ── Refresh user from server (e.g. after role change)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`);
      const u = data.user;
      localStorage.setItem("cps_user", JSON.stringify(u));
      setUser(u);
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};