import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null; // можно спиннер
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
