// server/utils/platform.js
const normalizePlatform = (p) => {
  const s = String(p || "").trim().toLowerCase();
  if (["tg", "telegram", "t.me"].includes(s) || s.startsWith("tg")) return "tg";
  if (["vk", "vkontakte", "вк"].includes(s)) return "vk";
  return s;
};

// варианты значений в БД, которые считаем эквивалентными
const variantsFor = (p) => {
  const n = normalizePlatform(p);
  if (n === "tg") return ["tg", "telegram"];
  if (n === "vk") return ["vk", "vkontakte", "вк"];
  return [n];
};

module.exports = { normalizePlatform, variantsFor };
