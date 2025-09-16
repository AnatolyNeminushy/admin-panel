// src/components/Protected.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guard-компонент: пропускает внутрь только авторизованных пользователей.
 * Если контекст аутентификации ещё не инициализирован (ready === false) — ничего не рендерит.
 * Если пользователь не авторизован — делает редирект на /login.
 */
export default function Protected({ children }) {
  const { user, ready } = useAuth();

  if (!ready) return null; // место для спиннера/скелетона
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
