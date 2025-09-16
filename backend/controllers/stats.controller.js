// controllers/stats.controller.js

/**
 * Статистика заказов и бронирований.
 * Все хендлеры возвращают агрегированную информацию для дашборда.
 * Единый контракт ответа: 200 OK при успехе, 500 с { error } при ошибке.
 */

const pool = require('../db');
const { getRange } = require('../utils/period');

/**
 * GET /stats/orders/total
 * Возвращает общее количество заказов.
 * Пример ответа: { count: 123 }
 */
exports.ordersTotal = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT COALESCE(COUNT(*), 0)::int AS count
      FROM orders
    `);
    return res.json(rows[0]);
  } catch (e) {
    
    console.error('ordersTotal error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * GET /stats/reservations/total
 * Возвращает общее количество бронирований.
 * Пример ответа: { count: 45 }
 */
exports.reservesTotal = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT COALESCE(COUNT(*), 0)::int AS count
      FROM reservations
    `);
    return res.json(rows[0]);
  } catch (e) {
    console.error('reservesTotal error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * GET /stats/orders/sum
 * Возвращает суммарный оборот по заказам.
 * Важно: тип bigint из PostgreSQL может приходить строкой.
 * Пример ответа: { sum: "157000" }
 */
exports.ordersSum = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT COALESCE(SUM(total), 0)::bigint AS sum
      FROM orders
    `);
    return res.json(rows[0]);
  } catch (e) {
    console.error('ordersSum error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * GET /stats/orders/extra
 * Доп.метрики по заказам:
 *  - avg: средний чек (int, округление на стороне БД)
 *  - maxDay: максимальная дневная выручка (bigint)
 * Пример ответа: { avg: 850, maxDay: "120000" }
 */
exports.ordersExtra = async (_req, res) => {
  try {
    const avgQ = await pool.query(`
      SELECT COALESCE(AVG(total)::numeric, 0)::int AS avg
      FROM orders
    `);

    const maxDayQ = await pool.query(`
      WITH per_day AS (
        SELECT COALESCE(date, created_at::date) AS d, SUM(total) AS day_sum
        FROM orders
        GROUP BY COALESCE(date, created_at::date)
      )
      SELECT COALESCE(MAX(day_sum), 0)::bigint AS "maxDay"
      FROM per_day
    `);

    return res.json({
      avg: avgQ.rows[0].avg,
      maxDay: maxDayQ.rows[0].maxDay,
    });
  } catch (e) {
    console.error('ordersExtra error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * GET /stats/orders/by-day?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Ежедневная статистика заказов за период:
 *  - day: дата (string, YYYY-MM-DD)
 *  - count: число заказов (int)
 *  - sum: выручка за день (bigint)
 * Пустые дни заполняются нулями через generate_series.
 */
exports.ordersByDay = async (req, res) => {
  try {
    const { from, to } = getRange(req);

    const sql = `
      WITH days AS (
        SELECT d::date AS day
        FROM generate_series($1::date, $2::date, interval '1 day') AS d
      )
      SELECT
        d.day::text AS day,
        COALESCE(COUNT(o.id), 0)::int AS count,
        COALESCE(SUM(o.total), 0)::bigint AS sum
      FROM days d
      LEFT JOIN orders o
        ON COALESCE(o.date, o.created_at::date) = d.day
      GROUP BY d.day
      ORDER BY d.day DESC
    `;

    const { rows } = await pool.query(sql, [from, to]);
    return res.json(rows);
  } catch (e) {
    console.error('ordersByDay error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};

/**
 * GET /stats/reservations/by-day?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Ежедневная статистика бронирований за период:
 *  - day: дата (string, YYYY-MM-DD)
 *  - count: число броней (int)
 *  - sum: всегда 0 (поле для совместимости с графиками)
 */
exports.reservesByDay = async (req, res) => {
  try {
    const { from, to } = getRange(req);

    const sql = `
      WITH days AS (
        SELECT d::date AS day
        FROM generate_series($1::date, $2::date, interval '1 day') AS d
      )
      SELECT
        d.day::text AS day,
        COALESCE(COUNT(r.id), 0)::int AS count,
        0::bigint AS sum
      FROM days d
      LEFT JOIN reservations r
        ON COALESCE(r.date, r.created_at::date) = d.day
      GROUP BY d.day
      ORDER BY d.day DESC
    `;

    const { rows } = await pool.query(sql, [from, to]);
    return res.json(rows);
  } catch (e) {
    console.error('reservesByDay error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};
