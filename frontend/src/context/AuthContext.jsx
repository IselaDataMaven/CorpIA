import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, loginRequest, logoutRequest } from "../api/authApi";

const AuthContext = createContext(null);
const SESSION_KEY = "corpia_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw =
      localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      setIsLoading(false);
      return;
    }
    try {
      const session = JSON.parse(raw);
      setUser(session);
      // Revalida el token contra el backend; si expiro, cierra sesion local.
      fetchCurrentUser()
        .then((freshUser) => {
          const merged = { ...session, ...freshUser };
          setUser(merged);
          const store = localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
          store.setItem(SESSION_KEY, JSON.stringify(merged));
        })
        .catch(() => {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } catch {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      setIsLoading(false);
    }
  }, []);

  const login = async ({ username, password, rememberMe }) => {
    const { access_token, user: apiUser } = await loginRequest({
      username,
      password,
      rememberMe,
    });
    const session = { ...apiUser, token: access_token };
    setUser(session);
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
