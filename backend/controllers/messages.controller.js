// controllers/messages.controller.js

/**
 * Контроллер сообщений.
 */

const pool = require('../db');

/**
 * GET /messages
 *
 * Два режима:
 * 1) Диалог (по chatId): ?chatId=123&limit=500&offset=0
 *    — Возвращает сообщения конкретного чата в хронологическом порядке (ASC).
 *
 * 2) Табличный режим: ?table=1&limit=50&offset=0&q=строка
 *    — Возвращает список сообщений с данными чатов и заголовком X-Total-Count
 *      для пагинации на фронтенде.
 */
exports.list = async (req, res) => {
  try {
    const tableMode = String(req.query.table || '') === '1';

    // ===== Режим 1: Диалог по chatId =====
    if (!tableMode) {
      const chatId = Number(req.query.chatId);
      if (!Number.isFinite(chatId)) {
        return res
          .status(400)
          .json({ error: 'chatId is required and must be a number' });
      }

      const { limit = '500', offset = '0' } = req.query;
      const lim = Math.min(parseInt(limit, 10) || 500, 1000);
      const off = Math.max(parseInt(offset, 10) || 0, 0);

      // Сначала берём последние N сообщений (DESC), затем разворачиваем (ASC),
      // чтобы фронт рисовал чат сверху вниз.
      const sql = `
        SELECT * FROM (
          SELECT id, chat_id, from_me, text, date
          FROM messages
          WHERE chat_id = $1
          ORDER BY date DESC, id DESC
          LIMIT $2 OFFSET $3
        ) t
        ORDER BY date ASC, id ASC
      `;
      const { rows } = await pool.query(sql, [chatId, lim, off]);
      return res.json(rows);
    }

    // ===== Режим 2: Таблица с поиском и пагинацией =====
    const { limit = '50', offset = '0', q = '' } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 50, 1000);
    const off = Math.max(parseInt(offset, 10) || 0, 0);

    // where и params формируются в зависимости от наличия q
    const params = [];
    let where = '';
    if (q) {
      // Поиск по тексту сообщения, username, и "Имя Фамилия"
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      where = `
        WHERE m.text ILIKE $1
           OR c.username ILIKE $2
           OR CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')) ILIKE $3
      `;
    }

    // Считаем общее количество строк под выдачу (для пагинации)
    const totalSql = `
      SELECT COUNT(*)::int AS cnt
      FROM messages m
      LEFT JOIN chats c ON c.chat_id = m.chat_id
      ${where}
    `;
    const total = (await pool.query(totalSql, params)).rows[0].cnt;

    // Основная выборка с limit/offset — параметризована
    const dataSql = `
      SELECT
        m.id, m.chat_id, m.from_me, m.text, m.date,
        c.username, c.first_name, c.last_name, c.platform
      FROM messages m
      LEFT JOIN chats c ON c.chat_id = m.chat_id
      ${where}
      ORDER BY m.date DESC, m.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, lim, off];
    const rows = (await pool.query(dataSql, dataParams)).rows;

    // Отдаём общее количество и сами элементы; X-Total-Count — удобно для таблиц
    res.set('X-Total-Count', String(total));
    return res.json({ items: rows, total });
  } catch (err) {
    // Централизованный 500, чтобы не "сыпать" стек наружу
    console.error('MESSAGES LIST ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * POST /messages/raw
 *
 * Создаёт запись сообщения "как есть".
 * Body: { chat_id: number, text: string, from_me?: boolean, date?: string | null }
 * Если date не передан — берём NOW().
 */
exports.createRaw = async (req, res) => {
  try {
    const { chat_id, text, from_me = false, date = null } = req.body || {};
    if (!chat_id || !text) {
      return res
        .status(400)
        .json({ error: 'chat_id and text are required' });
    }

    const sql = `
      INSERT INTO messages (chat_id, from_me, text, date)
      VALUES ($1, $2, $3, COALESCE($4, NOW()))
      RETURNING id, chat_id, from_me, text, date
    `;
    const { rows } = await pool.query(sql, [
      chat_id,
      !!from_me,
      String(text),
      date,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('CREATE MESSAGE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * PATCH /messages/:id
 *
 * Частичное обновление полей сообщения.
 * Body: { text?: string, from_me?: boolean, date?: string }
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'id must be number' });
    }

    const { text, from_me, date } = req.body || {};
    const sql = `
      UPDATE messages
      SET
        text = COALESCE($2, text),
        from_me = COALESCE($3, from_me),
        date = COALESCE($4, date)
      WHERE id = $1
      RETURNING id, chat_id, from_me, text, date
    `;
    const params = [
      id,
      text ?? null,
      typeof from_me === 'boolean' ? from_me : null,
      date ?? null,
    ];
    const { rows } = await pool.query(sql, params);

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('UPDATE MESSAGE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * DELETE /messages/:id
 *
 * Удаляет сообщение по первичному ключу.
 */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM messages WHERE id = $1',
      [id],
    );
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ ok: true, id });
  } catch (err) {
    console.error('REMOVE MESSAGE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
