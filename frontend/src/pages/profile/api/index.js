import api from "../../../services/api";

// Возвращает объект user или бросает ошибку (для 401 и прочего)
export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data?.user || null;
}
