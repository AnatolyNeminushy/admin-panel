// pages/profile/hooks/useProfile.js
import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { getMe } from '../api';

/**
 * Хук состояния страницы профиля:
 * - грузит текущего пользователя
 * - обрабатывает 401 (протухший токен): чистит локальное и уводит на /login
 * - предоставляет действия: refresh, onLogout, clearLocal
 */
export function useProfile({ navigate, logout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await getMe();
        if (mounted) setUser(u || null);
      } catch (e) {
        // 401 — неавторизован: очищаем токен и уводим на /login
        if (e?.response?.status === 401) {
          if (mounted) setUser(null);
          clearTokens();
          navigate('/login', { replace: true });
          return;
        }
        // прочие ошибки — показываем краткое сообщение
        if (mounted) {
          setUser(null);
          setErr('Не удалось загрузить профиль');
        }
        console.error('useProfile:getMe error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /**
   * Выход из аккаунта:
   * - вызываем внешний logout (если передан)
   * - чистим локальные токены
   * - редирект на /login
   */
  const onLogout = () => {
    try {
      logout?.();
    } finally {
      clearTokens();
      navigate('/login', { replace: true });
    }
  };

  /**
   * Принудительное обновление профиля:
   * - перезагружает user
   * - одинаково обрабатывает 401
   */
  const refresh = async () => {
    setErr('');
    setLoading(true);
    try {
      const u = await getMe();
      setUser(u || null);
    } catch (e) {
      if (e?.response?.status === 401) {
        setUser(null);
        clearTokens();
        navigate('/login', { replace: true });
        return;
      }
      setUser(null);
      setErr('Ошибка обновления данных');
      console.error('useProfile:refresh error', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Жёсткая очистка локального состояния авторизации:
   * - удаляет токены из local/session storage
   * - дополнительно чистит cookie при alsoCookie = true
   * - уводит на /login
   */
  const clearLocal = () => {
    try {
      logout?.();
    } finally {
      clearTokens(true);
      navigate('/login', { replace: true });
    }
  };

  /**
   * Инициал для аватарки:
   * - первая буква из fullName/full_name/email
   * - верхний регистр
   */
  const initial = useMemo(() => {
    const ch =
      user?.fullName?.[0] || user?.full_name?.[0] || user?.email?.[0] || '?';
    return (ch || '?').toUpperCase();
  }, [user]);

  return {
    user, loading, err, onLogout, refresh, clearLocal, initial,
  };
}

/**
 * Локальный помощник: подчистить все следы авторизации.
 * alsoCookie = true — дополнительно убираем auth cookie.
 */
function clearTokens(alsoCookie = false) {
  try {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    if (api?.defaults?.headers?.common) {
      delete api.defaults.headers.common.Authorization;
    }
    if (alsoCookie) {
      document.cookie = 'auth_token=; Max-Age=0; path=/';
    }
  } catch (e) {
    console.error('clearTokens error', e);
  }
}
