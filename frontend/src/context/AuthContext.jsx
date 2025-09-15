import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

// 1) Контекст — всегда одно и то же значение по экспорту
const AuthCtx = createContext(null);

// 2) Хук — всегда функция (никаких условных экспортов)
export const useAuth = () => useContext(AuthCtx);

// 3) Провайдер — дефолтный экспорт и только он
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {}
      setReady(true);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
