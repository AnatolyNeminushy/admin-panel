// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

// Контекст аутентификации: хранит текущего пользователя и методы входа/выхода.
const AuthCtx = createContext(null);

// Хук доступа к контексту.
export const useAuth = () => useContext(AuthCtx);

// Провайдер: при монтировании проверяет токен и подгружает пользователя.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // текущий пользователь или null
  const [ready, setReady] = useState(false); // готовность: true после первичной загрузки

  useEffect(() => {
    const loadUser = async () => {
      try {
        // /auth/me возвращает { user: {...} } или { user: null }
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        // если токен отсутствует/невалиден — оставляем user = null
      } finally {
        setReady(true);
      }
    };
    loadUser();
  }, []);

  // Вход: отправляем email/password, сохраняем токен, кладём пользователя в state.
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      // Пробрасываем читаемое сообщение для UI: toast/alert
      const msg = e?.response?.data?.error || 'Login failed';
      throw new Error(msg);
    }
  };

  // Выход: удаляем токен и сбрасываем пользователя.
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
