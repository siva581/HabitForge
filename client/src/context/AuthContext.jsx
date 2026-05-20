import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);

  async function loadSession() {
    const token = localStorage.getItem("habitforge-token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await api.get("/auth/me");
      setUser(me.user);
      await refreshSummary();
    } catch {
      localStorage.removeItem("habitforge-token");
      setUser(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshSummary() {
    const response = await api.get("/dashboard/summary");
    setSummary(response);
    setUser((current) => (current ? { ...current, ...response.user } : response.user));
    return response;
  }

  function announceReward(nextReward) {
    setReward({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...nextReward
    });
  }

  function clearReward() {
    setReward(null);
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function login(payload) {
    const response = await api.post("/auth/login", payload);
    localStorage.setItem("habitforge-token", response.token);
    setUser(response.user);
    await refreshSummary();
  }

  async function register(payload) {
    const response = await api.post("/auth/register", payload);
    localStorage.setItem("habitforge-token", response.token);
    setUser(response.user);
    await refreshSummary();
  }

  function logout() {
    localStorage.removeItem("habitforge-token");
    setUser(null);
    setSummary(null);
  }

  const value = {
    user,
    summary,
    loading,
    reward,
    login,
    register,
    logout,
    refreshSummary,
    loadSession,
    setUser,
    announceReward,
    clearReward
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
