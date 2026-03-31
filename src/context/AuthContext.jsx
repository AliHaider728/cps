// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { authAPI } from "../api/api";

const AuthContext = createContext(null);

const setAxiosToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cps_user");
    const token = localStorage.getItem("cps_token");
    if (saved && token) {
      setAxiosToken(token);
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password);
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

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setAxiosToken(null);
    localStorage.removeItem("cps_token");
    localStorage.removeItem("cps_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem("cps_user", JSON.stringify(data.user));
      setUser(data.user);
    } catch { logout(); }
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