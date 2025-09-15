const { runBroadcast, previewRecipients } = require("../services/broadcast.service");

// безопасные парсеры
const toArray = (v) =>
  Array.isArray(v) ? v : v == null ? [] : String(v).split(",").map(s => s.trim()).filter(Boolean);

const toJSON = (v, fallback = {}) => {
  if (v == null) return fallback;
  if (typeof v === "object") return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

exports.preview = async (req, res, next) => {
  try {
    const plats = toArray(req.query.platforms);
    const filters = toJSON(req.query.filters, { onlyActiveDays: 90, minOrders: 0, platform: "any" });
    const limit = Number(req.query.limit) || 200;
    const platforms = plats.length ? plats : ["tg", "vk"];

    const items = (await previewRecipients({ platforms, filters, limit })) || [];
    res.json({ total: items.length, items });
  } catch (err) {
    next(err);
  }
};

exports.sendBroadcast = async (req, res) => {
  const {
    title = "Без названия",
    text = "",
    imageUrl = null,
    platforms = ["tg"],
    filters = { onlyActiveDays: 90, minOrders: 0, platform: "any" },
    testMode = true,
    mode = "all",           // 'all' | 'limit' | 'selected'
    limit = null,
    recipientIds = [],
  } = req.body || {};

  if (!text?.trim() && mode !== "selected") {
    return res.status(400).json({ error: "Пустой текст", testMode, total: 0 });
  }

  const result = await runBroadcast({
    title, text, imageUrl, platforms, filters, testMode, mode, limit, recipientIds,
  });

  res.json(result);
};
