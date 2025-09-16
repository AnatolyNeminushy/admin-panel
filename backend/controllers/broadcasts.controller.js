// controllers/broadcast.controller.js

/**
 * Контроллер рассылок.
 */

const { runBroadcast, previewRecipients } = require('../services/broadcast.service');

// --- безопасные парсеры ------------------------------------------------------

/**
 * Превращает "a,b , c" или массив в массив строк.
 * Пустые значения -> [].
 */
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Парсит JSON-строку или возвращает fallback.
 */
const toJSON = (v, fallback = {}) => {
  if (v == null) return fallback;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

// --- Вспомогательные валидаторы ----------------------------------------------

const ALLOWED_PLATFORMS = new Set(['tg', 'vk']);
const ALLOWED_MODES = new Set(['all', 'limit', 'selected']);

const sanitizePlatforms = (v, fallback) => {
  const arr = toArray(v);
  const filtered = arr.filter((p) => ALLOWED_PLATFORMS.has(String(p)));
  return filtered.length ? filtered : fallback;
};

const toPositiveIntOrNull = (v) => {
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return null;
};

const isArrayOfStringOrNumber = (v) =>
  Array.isArray(v) && v.every((x) => ['string', 'number'].includes(typeof x));

// --- Контроллеры --------------------------------------------------------------

/**
 * GET /api/broadcasts/recipients/preview
 * Query:
 *  - platforms: "tg,vk" | string[] (опционально; дефолт ['tg','vk'])
 *  - filters: JSON | объект (опционально; есть дефолт)
 *  - limit: number (опционально; дефолт 200)
 */
exports.preview = async (req, res, next) => {
  try {
    const platforms = sanitizePlatforms(req.query.platforms, ['tg', 'vk']);
    const filters = toJSON(req.query.filters, {
      onlyActiveDays: 90,
      minOrders: 0,
      platform: 'any',
    });
    const limit = toPositiveIntOrNull(req.query.limit) ?? 200;

    const items = (await previewRecipients({ platforms, filters, limit })) || [];
    return res.json({ total: items.length, items });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/broadcasts
 * Body:
 *  - title: string (опц., дефолт "Без названия")
 *  - text: string (обязателен, кроме mode="selected")
 *  - imageUrl: string | null
 *  - platforms: ("tg"|"vk")[] (опц., дефолт ['tg'])
 *  - filters: объект фильтров (опц., дефолт ниже)
 *  - testMode: boolean (опц., дефолт true)
 *  - mode: 'all' | 'limit' | 'selected' (опц., дефолт 'all')
 *  - limit: number > 0 (обязателен, если mode='limit')
 *  - recipientIds: (string|number)[] (обязателен, если mode='selected')
 */
exports.sendBroadcast = async (req, res, next) => {
  try {
    const {
      title = 'Без названия',
      text = '',
      imageUrl = null,
      platforms: rawPlatforms = ['tg'],
      filters = { onlyActiveDays: 90, minOrders: 0, platform: 'any' },
      testMode = true,
      mode: rawMode = 'all', // 'all' | 'limit' | 'selected'
      limit: rawLimit = null,
      recipientIds: rawRecipientIds = [],
    } = req.body || {};

    // --- sanitize & validate --------------------------------------------------

    const platforms = sanitizePlatforms(rawPlatforms, ['tg']);
    const mode = String(rawMode);

    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    if (!text.trim() && mode !== 'selected') {
      return res.status(400).json({ error: 'Пустой текст', testMode, total: 0 });
    }

    let limit = null;
    if (mode === 'limit') {
      limit = toPositiveIntOrNull(rawLimit);
      if (!limit) {
        return res.status(400).json({ error: 'limit must be a positive integer for mode=limit' });
      }
    }

    let recipientIds = [];
    if (mode === 'selected') {
      if (!isArrayOfStringOrNumber(rawRecipientIds) || rawRecipientIds.length === 0) {
        return res.status(400).json({ error: 'recipientIds must be a non-empty array' });
      }
      // нормализуем ID (например, UUID/строки оставляем как есть)
      recipientIds = rawRecipientIds;
    }

    // --- run ------------------------------------------------------------------

    const result = await runBroadcast({
      title,
      text,
      imageUrl,
      platforms,
      filters,
      testMode: Boolean(testMode),
      mode,
      limit,
      recipientIds,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
};
