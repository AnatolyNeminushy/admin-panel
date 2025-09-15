import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { getMe } from "../api";

export function useProfile({ navigate, logout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getMe();
        if (mounted) setUser(u || null);
      } catch (e) {
        if (e?.response?.status === 401) {
          // токен протух — выходим на логин
          if (mounted) setUser(null);
          clearTokens();
          navigate("/login", { replace: true });
          return;
        }
        if (mounted) {
          setUser(null);
          setErr("Не удалось загрузить профиль");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onLogout = () => {
    try {
      logout?.();
    } finally {
      clearTokens();
      navigate("/login", { replace: true });
    }
  };

  const refresh = async () => {
    setErr("");
    setLoading(true);
    try {
      const u = await getMe();
      setUser(u || null);
    } catch (e) {
      if (e?.response?.status === 401) {
        setUser(null);
        clearTokens();
        navigate("/login", { replace: true });
        return;
      }
      setUser(null);
      setErr("Ошибка обновления данных");
    } finally {
      setLoading(false);
    }
  };

  const clearLocal = () => {
    try {
      logout?.();
    } finally {
      clearTokens(true);
      navigate("/login", { replace: true });
    }
  };

  const initial = useMemo(() => {
    const ch =
      user?.full_name?.[0] ||
      user?.email?.[0] ||
      "?";
    return (ch || "?").toUpperCase();
  }, [user]);

  return { user, loading, err, onLogout, refresh, clearLocal, initial };
}

// локальный хелпер: подчистить все следы авторизации
function clearTokens(alsoCookie = false) {
  try {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    if (api?.defaults?.headers?.common) {
      delete api.defaults.headers.common.Authorization;
    }
    if (alsoCookie) {
      document.cookie = "auth_token=; Max-Age=0; path=/";
    }
  } catch {}
}
