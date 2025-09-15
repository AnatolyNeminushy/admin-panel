// server/controllers/stats.controller.js
const pool = require("../db");
const { getRange } = require("../utils/period");

exports.ordersTotal = async (_req, res) => {
  const { rows } = await pool.query(`SELECT COALESCE(COUNT(*), 0)::int AS count FROM orders`);
  res.json(rows[0]);
};
exports.reservesTotal = async (_req, res) => {
  const { rows } = await pool.query(`SELECT COALESCE(COUNT(*), 0)::int AS count FROM reservations`);
  res.json(rows[0]);
};
exports.ordersSum = async (_req, res) => {
  const { rows } = await pool.query(`SELECT COALESCE(SUM(total), 0)::bigint AS sum FROM orders`);
  res.json(rows[0]);
};
exports.ordersExtra = async (_req, res) => {
  const avgQ = await pool.query(`SELECT COALESCE(AVG(total)::numeric, 0)::int AS avg FROM orders`);
  const maxDayQ = await pool.query(`
    SELECT COALESCE(MAX(day_sum), 0)::bigint AS "maxDay"
    FROM (
      SELECT COALESCE(date, created_at::date) AS d, SUM(total) AS day_sum
      FROM orders
      GROUP BY COALESCE(date, created_at::date)
    ) t
  `);
  res.json({ avg: avgQ.rows[0].avg, maxDay: maxDayQ.rows[0].maxDay });
};
exports.ordersByDay = async (req, res) => {
  const { from, to } = getRange(req);
  const sql = `
    WITH days AS (
      SELECT d::date AS day
      FROM generate_series($1::date, $2::date, interval '1 day') AS d
    )
    SELECT d.day::text AS day,
           COALESCE(COUNT(o.id), 0)::int AS count,
           COALESCE(SUM(o.total), 0)::bigint AS sum
    FROM days d
    LEFT JOIN orders o ON COALESCE(o.date, (o.created_at)::date) = d.day
    GROUP BY d.day
    ORDER BY d.day DESC;
  `;
  const { rows } = await pool.query(sql, [from, to]);
  res.json(rows);
};
exports.reservesByDay = async (req, res) => {
  const { from, to } = getRange(req);
  const sql = `
    WITH days AS (
      SELECT d::date AS day
      FROM generate_series($1::date, $2::date, interval '1 day') AS d
    )
    SELECT d.day::text AS day,
           COALESCE(COUNT(r.id), 0)::int AS count,
           0::bigint AS sum
    FROM days d
    LEFT JOIN reservations r ON COALESCE(r.date, (r.created_at)::date) = d.day
    GROUP BY d.day
    ORDER BY d.day DESC;
  `;
  const { rows } = await pool.query(sql, [from, to]);
  res.json(rows);
};
