// controllers/chats.controller.js

/**
 * Контроллер чатов.
 */

const pool = require('../db');

/**
 * GET /api/chats
 * Query:
 *  - limit?: number (<= 5000, default 100)
 *  - offset?: number (>= 0, default 0)
 *  - q?: string (поиск по username/first_name/last_name, ILIKE)
 * Headers:
 *  - X-Total-Count: общее количество записей под фильтром
 * Body:
 *  - { items: Array<{chat_id, username, first_name, last_name, platform, last_ts}>, total: number }
 */
exports.list = async (req, res, next) => {
  const { limit = '100', offset = '0', q = '' } = req.query;

  // Нормализация и защитные рамки
  const lim = Math.min(Number.parseInt(limit, 10) || 100, 5000);
  const off = Math.max(Number.parseInt(offset, 10) || 0, 0);
  const query = String(q || '').trim();

  // (Опционально) Ограничим длину поисковой строки
  if (query.length > 200) {
    return res.status(400).json({ error: 'q is too long (max 200)' });
  }

  const params = [];
  let i = 1;

  let whereChats = '';
  if (query) {
    whereChats = `
      WHERE COALESCE(c.username, '') ILIKE $${i}
         OR COALESCE(c.first_name, '') ILIKE $${i}
         OR COALESCE(c.last_name,  '') ILIKE $${i}
    `;
    params.push(`%${query}%`);
    i += 1;
  }

  const countSql = `
    WITH base AS (
      SELECT c.chat_id
      FROM chats c
      ${whereChats}
      GROUP BY c.chat_id
    )
    SELECT COUNT(*)::int AS total
    FROM base
  `;

  const listSql = `
    WITH base AS (
      SELECT
        c.chat_id,
        MAX(c.username)   AS username,
        MAX(c.first_name) AS first_name,
        MAX(c.last_name)  AS last_name,
        MAX(c.platform)   AS platform
      FROM chats c
      ${whereChats}
      GROUP BY c.chat_id
    ),
    last_msg AS (
      SELECT m.chat_id, MAX(m.date) AS last_ts
      FROM messages m
      GROUP BY m.chat_id
    ),
    merged AS (
      SELECT
        b.chat_id,
        b.username,
        b.first_name,
        b.last_name,
        b.platform,
        lm.last_ts
      FROM base b
      LEFT JOIN last_msg lm ON lm.chat_id = b.chat_id
    )
    SELECT
      chat_id,
      username,
      first_name,
      last_name,
      platform,
      last_ts
    FROM merged
    ORDER BY last_ts DESC NULLS LAST, chat_id DESC
    LIMIT $${i} OFFSET $${i + 1}
  `;

  const client = await pool.connect();
  try {
    const [{ rows: countRows }, { rows: listRows }] = await Promise.all([
      client.query(countSql, params),
      client.query(listSql, [...params, lim, off]),
    ]);
    const total = countRows?.[0]?.total ?? 0;

    res.set('X-Total-Count', String(total));
    return res.json({ items: listRows, total });
  } catch (e) {
    return next(e);
  } finally {
    client.release();
  }
};

/**
 * POST /api/chats
 * Body:
 *  - { chat_id: number, username?: string|null, first_name?: string|null, last_name?: string|null, platform?: string|null }
 * Поведение:
 *  - Вставляет или обновляет запись по chat_id (UPSERT).
 *  - Возвращает 400, если chat_id не число.
 */
exports.createOrUpsert = async (req, res, next) => {
  try {
    const {
      chat_id: chatIdRaw,
      username = null,
      first_name = null,
      last_name = null,
      platform = null,
    } = req.body || {};

    const chatId = Number(chatIdRaw);
    if (!Number.isFinite(chatId)) {
      return res.status(400).json({ error: 'chat_id (number) is required' });
    }

    const sql = `
      INSERT INTO chats (chat_id, username, first_name, last_name, platform)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (chat_id) DO UPDATE SET
        username   = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name,
        platform   = EXCLUDED.platform
      RETURNING chat_id, username, first_name, last_name, platform
    `;

    const { rows } = await pool.query(sql, [
      chatId,
      username,
      first_name,
      last_name,
      platform,
    ]);

    return res.json(rows[0]);
  } catch (e) {
    return next(e);
  }
};

/**
 * PATCH /api/chats/:chat_id
 * Body:
 *  - { username?: string|null, first_name?: string|null, last_name?: string|null, platform?: string|null }
 * Поведение:
 *  - Возвращает 400, если chat_id не число.
 *  - Возвращает 404, если запись не найдена.
 */
exports.update = async (req, res, next) => {
  try {
    const chatId = Number(req.params.chat_id);
    if (!Number.isFinite(chatId)) {
      return res.status(400).json({ error: 'chat_id must be number' });
    }

    const {
      username = null,
      first_name = null,
      last_name = null,
      platform = null,
    } = req.body || {};

    const { rows } = await pool.query(
      `
      UPDATE chats
      SET
        username   = $2,
        first_name = $3,
        last_name  = $4,
        platform   = $5
      WHERE chat_id = $1
      RETURNING chat_id, username, first_name, last_name, platform
      `,
      [chatId, username, first_name, last_name, platform],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(rows[0]);
  } catch (e) {
    return next(e);
  }
};

/**
 * DELETE /api/chats/:chat_id
 * Поведение:
 *  - 204, если удалено; 404, если не найдено.
 *  - Сообщения удаляются каскадно (FOREIGN KEY ... ON DELETE CASCADE).
 */
exports.remove = async (req, res, next) => {
  try {
    const chatId = Number(req.params.chat_id);
    if (!Number.isFinite(chatId)) {
      return res.status(400).json({ error: 'chat_id must be number' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM chats WHERE chat_id = $1',
      [chatId],
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
};
