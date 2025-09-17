// controllers/orders.controller.js
const pool = require('../db');
const events = require('../utils/events');

/**
 * Контроллер заказов.
 * Эндпоинты:
 *  - GET /api/orders        — список/таблица с фильтрами и пагинацией
 *  - POST /api/orders       — создать заказ
 *  - PUT /api/orders/:id    — частичное обновление заказа
 *  - DELETE /api/orders/:id — удалить заказ
 *
 * Форматы ответа всегда JSON. В табличном режиме в заголовке есть X-Total-Count.
 */

/**
 * GET /api/orders
 *
 * Режимы:
 *  1) «Короткий список» (для аналитики): по умолчанию.
 *     Поля: guest_name, total_amount, date. Параметр: ?limit=число (по умолчанию 100, максимум 5000).
 *
 *  2) «Табличный режим» (?table=1): возвращает подробные записи с фильтрами, поиском и пагинацией.
 *     Параметры:
 *       - q: строка для поиска по tg_username/name/phone/address/comment (ILIKE)
 *       - platform, order_type: фильтры по совпадению
 *       - date_from, date_to: границы по дате (сравниваем с COALESCE(date, created_at::date))
 *       - min_total, max_total: числовые границы суммы
 *       - limit (<=1000), offset (>=0)
 */
exports.list = async (req, res) => {
  try {
    // ------ КОРОТКИЙ СПИСОК (для аналитики) ------
    if (String(req.query.table || '') !== '1') {
      const limit = Math.min(parseInt(req.query.limit || '100', 10), 5000);
      const sql = `
        SELECT
          name AS guest_name,
          COALESCE(total, 0) AS total_amount,
          COALESCE(date::timestamp, created_at) AS date
        FROM orders
        ORDER BY COALESCE(date, created_at::date) DESC, created_at DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(sql, [limit]);
      return res.json({ items: rows });
    }

    // ------ ТАБЛИЧНЫЙ РЕЖИМ ------
    const { limit = '50', offset = '0', q = '' } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 50, 1000);
    const off = Math.max(parseInt(offset, 10) || 0, 0);

    const params = [];
    let where = '';

    // Текстовый поиск по нескольким полям (ILIKE).
    if (q) {
      // Пять плейсхолдеров подряд: tg_username, name, phone, address, comment.
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      where +=
        (where ? ' AND ' : ' WHERE ') +
        `
        (
          COALESCE(tg_username, '') ILIKE $${params.length - 4}
          OR COALESCE(name, '') ILIKE $${params.length - 3}
          OR COALESCE(phone, '') ILIKE $${params.length - 2}
          OR COALESCE(address, '') ILIKE $${params.length - 1}
          OR COALESCE(comment, '') ILIKE $${params.length}
        )
      `;
    }

    // Фильтры по платформе/типу/датам/суммам.
    const { platform, order_type, date_from, date_to, min_total, max_total } = req.query;

    if (platform) {
      params.push(String(platform).toLowerCase());
      where += (where ? ' AND ' : ' WHERE ') + `LOWER(COALESCE(platform, '')) = $${params.length}`;
    }
    if (order_type) {
      params.push(String(order_type).toLowerCase());
      where += (where ? ' AND ' : ' WHERE ') + `LOWER(COALESCE(order_type, '')) = $${params.length}`;
    }
    if (date_from) {
      // Включительно с date_from
      params.push(date_from);
      where += (where ? ' AND ' : ' WHERE ') + `COALESCE(date, created_at::date) >= $${params.length}`;
    }
    if (date_to) {
      // Включительно по date_to
      params.push(date_to);
      where += (where ? ' AND ' : ' WHERE ') + `COALESCE(date, created_at::date) <= $${params.length}`;
    }
    if (min_total !== undefined && min_total !== '' && !Number.isNaN(Number(min_total))) {
      params.push(Number(min_total));
      where += (where ? ' AND ' : ' WHERE ') + `COALESCE(total, 0) >= $${params.length}`;
    }
    if (max_total !== undefined && max_total !== '' && !Number.isNaN(Number(max_total))) {
      params.push(Number(max_total));
      where += (where ? ' AND ' : ' WHERE ') + `COALESCE(total, 0) <= $${params.length}`;
    }

    // Общее количество для пагинации (возвращаем также в заголовке X-Total-Count).
    const totalSql = `SELECT COUNT(*)::int AS cnt FROM orders ${where}`;
    const total = (await pool.query(totalSql, params)).rows[0].cnt;

    // Данные страницы.
    const dataSql = `
      SELECT
        id, tg_username, name, phone, order_type, date, time,
        address, items, total, comment, platform, created_at
      FROM orders
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    const rows = (await pool.query(dataSql, [...params, lim, off])).rows;

    res.set('X-Total-Count', String(total));
    return res.json({ items: rows, total });
  } catch (e) {
    // Непредвиденная ошибка (например, БД) — 500.
    console.error('ORDERS LIST ERROR:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * POST /api/orders
 *
 * Создаёт заказ. Вставляет ровно те поля, что переданы в body (остальные — NULL),
 * и автоматически проставляет created_at = NOW().
 * Возвращает созданную запись.
 */
exports.create = async (req, res) => {
  try {
    const {
      tg_username = null,
      name = null,
      phone = null,
      order_type = null,
      date = null,
      time = null,
      address = null,
      items = null, // обычно JSON со списком позиций
      total = null, // общая сумма заказа
      comment = null,
      platform = null, // источник (tg/vk)
    } = req.body || {};

    const { rows } = await pool.query(
      `
      INSERT INTO orders
        (tg_username, name, phone, order_type, date, time, address, items, total, comment, platform, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING
        id, tg_username, name, phone, order_type, date, time, address, items, total, comment, platform, created_at
      `,
      [
        tg_username,
        name,
        phone,
        order_type,
        date,
        time,
        address,
        items,
        total,
        comment,
        platform,
      ],
    );

    const row = rows[0];
    // оповестим подписчиков таблицы
    events.broadcast('orders', { action: 'create', row });
    return res.json(row);
  } catch (e) {
    console.error('ORDERS CREATE ERROR:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * PUT /api/orders/:id
 *
 * Частичное обновление: каждый столбец берёт новое значение, если оно передано,
 * иначе остаётся прежним через COALESCE.
 * Возвращает обновлённую запись или 404 если id нет.
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'id must be number' });
    }

    const {
      tg_username,
      name,
      phone,
      order_type,
      date,
      time,
      address,
      items,
      total,
      comment,
      platform,
    } = req.body || {};

    const { rows } = await pool.query(
      `
      UPDATE orders SET
        tg_username = COALESCE($2, tg_username),
        name        = COALESCE($3, name),
        phone       = COALESCE($4, phone),
        order_type  = COALESCE($5, order_type),
        date        = COALESCE($6, date),
        time        = COALESCE($7, time),
        address     = COALESCE($8, address),
        items       = COALESCE($9, items),
        total       = COALESCE($10, total),
        comment     = COALESCE($11, comment),
        platform    = COALESCE($12, platform)
      WHERE id = $1
      RETURNING
        id, tg_username, name, phone, order_type, date, time, address, items, total, comment, platform, created_at
      `,
      [
        id,
        tg_username,
        name,
        phone,
        order_type,
        date,
        time,
        address,
        items,
        total,
        comment,
        platform,
      ],
    );

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const row = rows[0];
    events.broadcast('orders', { action: 'update', row });
    return res.json(row);
  } catch (e) {
    console.error('ORDERS UPDATE ERROR:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * DELETE /api/orders/:id
 *
 * Удаляет запись по id. Возвращает { ok: true, id } или 404, если не найдено.
 */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'id must be number' });
    }

    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    events.broadcast('orders', { action: 'delete', id });
    return res.json({ ok: true, id });
  } catch (e) {
    console.error('ORDERS DELETE ERROR:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};
