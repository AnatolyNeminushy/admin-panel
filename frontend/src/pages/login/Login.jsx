import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Input from "../../components/Input";
import VantaBg from "../../components/VantaBg";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/chats"); // надёжнее, чем window.location.href
    } catch (e) {
      setErr(e?.response?.data?.error || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <VantaBg color={0x0d8d7e} backgroundColor={0x0c1633} showDots />

      <div className="relative z-10 w-[350px] bg-white/20 backdrop-blur p-6 rounded-xl shadow">
        <h1 className="text-4xl font-bold text-center mb-4 gradient-chaos">
          NM.LAB
        </h1>

        <h2 className="text-xl font-medium text-white/80 text-center mb-4">
          Вход в админ-панель
        </h2>

        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Пароль"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            variant="secondary"
          >
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
