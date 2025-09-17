// controllers/reserves.controller.js
const pool = require('../db');
const events = require('../utils/events');

/**
 * Контроллер бронирований.
 * Этот контроллер обслуживает список, создание, обновление и удаление записей в таблице `reservations`.
 * Все SQL-запросы параметризованы (защита от SQL-инъекций).
 */

/**
 * GET /api/reserves
 *
 * Режимы:
 *  - Короткий список (по умолчанию): для компактного вывода. Возвращает имя гостя, сумму (0) и дату.
 *    Параметры: ?limit=число (по умолчанию 100, максимум 5000).
 *
 *  - Табличный режим: ?table=1
 *    Поддерживает фильтры и пагинацию.
 *    Параметры:
 *      - q: строка для текстового поиска по tg_username/name/phone/address (ILIKE)
 *      - date_from, date_to: фильтр по дате (COALESCE(date, created_at::date))
 *      - min_guests, max_guests: фильтр по количеству гостей
 *      - limit (≤ 1000), offset (≥ 0)
 *
 * Заголовок ответа: X-Total-Count — общее число записей под фильтрами (для пагинации).
 */
exports.list = async (req, res) => {
  try {
    // --- короткий список ---
    if (String(req.query.table || '') !== '1') {
      const limit = Math.min(parseInt(req.query.limit || '100', 10), 5000);

      const sql = `
        SELECT
          name AS guest_name,
          0 AS total_amount, -- бизнес-логика: агрегатов нет, отдаём 0
          COALESCE(date::timestamp, created_at) AS date
        FROM reservations
        ORDER BY COALESCE(date, created_at::date) DESC, created_at DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(sql, [limit]);
      return res.json({ items: rows });
    }

    // --- табличный режим ---
    const { limit = '50', offset = '0' } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 50, 1000);
    const off = Math.max(parseInt(offset, 10) || 0, 0);

    const params = [];
    let where = '';

    // Текстовый поиск (обрезаем и ограничиваем длину)
    const qRaw = (req.query.q || '').toString().trim();
    const q = qRaw.length > 200 ? qRaw.slice(0, 200) : qRaw;

    if (q) {
      // индексы считаем от текущей длины params
      const base = params.length;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      where +=
        (where ? ' AND ' : ' WHERE ') +
        `
        (
          COALESCE(tg_username, '') ILIKE $${base + 1}
          OR COALESCE(name, '') ILIKE $${base + 2}
          OR COALESCE(phone, '') ILIKE $${base + 3}
          OR COALESCE(address, '') ILIKE $${base + 4}
        )
      `;
    }

    // Диапазон дат
    const { date_from, date_to, min_guests, max_guests } = req.query;

    if (date_from) {
      params.push(date_from);
      where +=
        (where ? ' AND ' : ' WHERE ') +
        `COALESCE(date, created_at::date) >= $${params.length}`;
    }
    if (date_to) {
      params.push(date_to);
      where +=
        (where ? ' AND ' : ' WHERE ') +
        `COALESCE(date, created_at::date) <= $${params.length}`;
    }

    // Фильтры по количеству гостей
    if (
      min_guests !== undefined &&
      min_guests !== '' &&
      !Number.isNaN(Number(min_guests))
    ) {
      params.push(Number(min_guests));
      where +=
        (where ? ' AND ' : ' WHERE ') + `COALESCE(guests, 0) >= $${params.length}`;
    }
    if (
      max_guests !== undefined &&
      max_guests !== '' &&
      !Number.isNaN(Number(max_guests))
    ) {
      params.push(Number(max_guests));
      where +=
        (where ? ' AND ' : ' WHERE ') + `COALESCE(guests, 0) <= $${params.length}`;
    }

    // Всего записей (для пагинации)
    const totalSql = `SELECT COUNT(*)::int AS cnt FROM reservations ${where}`;
    const total = (await pool.query(totalSql, params)).rows[0].cnt;

    // Данные страницы
    const dataSql = `
      SELECT
        id, tg_username, name, phone, address, date, time,
        guests, comment, platform, created_at
      FROM reservations
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const rows = (await pool.query(dataSql, [...params, lim, off])).rows;

    res.set('X-Total-Count', String(total));
    return res.json({ items: rows, total });
  } catch (err) {
    // Единый безопасный ответ
    console.error('RESERVES LIST ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * POST /api/reserves
 *
 * Создаёт бронь.
 * Body:
 *  {
 *    tg_username?, name?, phone?, address?,
 *    date?, time?, guests?, comment?
 *  }
 * Возвращает созданную запись.
 */
exports.create = async (req, res) => {
  try {
    const {
      tg_username = null,
      name = null,
      phone = null,
      address = null,
      date = null,
      time = null,
      guests = null,
      comment = null, 
    } = req.body || {};

    // Простая валидация количества гостей
    if (guests != null && (Number.isNaN(Number(guests)) || Number(guests) < 0)) {
      return res.status(400).json({ error: 'guests must be a non-negative number' });
    }

    const sql = `
      INSERT INTO reservations
        (tg_username, name, phone, address, date, time, guests, comment, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING
        id, tg_username, name, phone, address, date, time, guests, comment, created_at
    `;
    const { rows } = await pool.query(sql, [
      tg_username,
      name,
      phone,
      address,
      date,
      time,
      guests,
      comment,
    ]);
    const row = rows[0];
    events.broadcast('reservations', { action: 'create', row });
    return res.json(row);
  } catch (err) {
    console.error('RESERVES CREATE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * PUT /api/reserves/:id
 *
 * Частичное обновление брони.
 * - Любое поле, переданное как `null` или не переданное, будет проигнорировано (COALESCE оставит старое значение).
 * Возвращает обновлённую запись.
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
      address,
      date,
      time,
      guests,
      comment, // platform отсутствует в данном контроллере
    } = req.body || {};

    if (guests !== undefined && guests !== null) {
      if (Number.isNaN(Number(guests)) || Number(guests) < 0) {
        return res.status(400).json({ error: 'guests must be a non-negative number' });
      }
    }

    const sql = `
      UPDATE reservations SET
        tg_username = COALESCE($2, tg_username),
        name        = COALESCE($3, name),
        phone       = COALESCE($4, phone),
        address     = COALESCE($5, address),
        date        = COALESCE($6, date),
        time        = COALESCE($7, time),
        guests      = COALESCE($8, guests),
        comment     = COALESCE($9, comment)
      WHERE id = $1
      RETURNING id, tg_username, name, phone, address, date, time, guests, comment, created_at
    `;
    const { rows } = await pool.query(sql, [
      id,
      tg_username,
      name,
      phone,
      address,
      date,
      time,
      guests,
      comment,
    ]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Not found' });
    }
    const row = rows[0];
    events.broadcast('reservations', { action: 'update', row });
    return res.json(row);
  } catch (err) {
    console.error('RESERVES UPDATE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * DELETE /api/reserves/:id
 *
 * Удаляет бронь по идентификатору.
 * Возвращает { ok: true, id } при успехе.
 */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'id must be number' });
    }

    const { rowCount } = await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }
    events.broadcast('reservations', { action: 'delete', id });
    return res.json({ ok: true, id });
  } catch (err) {
    console.error('RESERVES REMOVE ERROR:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
