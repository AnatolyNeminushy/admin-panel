// server/controllers/reserves.controller.js
const pool = require("../db");

/**
 * GET /api/reserves
 * - ?table=1 — табличный режим с фильтрами и пагинацией
 * - иначе — короткий список (guest_name, total_amount=0, date)
 */
exports.list = async (req, res) => {
  if (String(req.query.table || "") !== "1") {
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 5000);
    const sql = `
      SELECT
        name AS guest_name,
        0 AS total_amount,
        COALESCE(date::timestamp, created_at) AS date
      FROM reservations
      ORDER BY COALESCE(date, created_at::date) DESC, created_at DESC
      LIMIT $1;
    `;
    const { rows } = await pool.query(sql, [limit]);
    return res.json({ items: rows });
  }

  // ---- table mode ----
  const { limit = "50", offset = "0", q = "" } = req.query;
  const lim = Math.min(parseInt(limit, 10) || 50, 1000);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  const params = [];
  let where = "";

  // текстовый поиск
  if (q) {
    // четыре плейсхолдера: tg_username, name, phone, address
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    where +=
      (where ? " AND " : " WHERE ") +
      `
      (COALESCE(tg_username,'') ILIKE $${params.length - 3}
       OR COALESCE(name,'') ILIKE $${params.length - 2}
       OR COALESCE(phone,'') ILIKE $${params.length - 1}
       OR COALESCE(address,'') ILIKE $${params.length})
    `;
  }

  // фильтры
  const { date_from, date_to, min_guests, max_guests } = req.query;

  if (date_from) {
    params.push(date_from);
    where +=
      (where ? " AND " : " WHERE ") +
      `COALESCE(date, created_at::date) >= $${params.length}`;
  }
  if (date_to) {
    params.push(date_to);
    where +=
      (where ? " AND " : " WHERE ") +
      `COALESCE(date, created_at::date) <= $${params.length}`;
  }
  if (
    min_guests !== undefined &&
    min_guests !== "" &&
    !Number.isNaN(Number(min_guests))
  ) {
    params.push(Number(min_guests));
    where +=
      (where ? " AND " : " WHERE ") +
      `COALESCE(guests,0) >= $${params.length}`;
  }
  if (
    max_guests !== undefined &&
    max_guests !== "" &&
    !Number.isNaN(Number(max_guests))
  ) {
    params.push(Number(max_guests));
    where +=
      (where ? " AND " : " WHERE ") +
      `COALESCE(guests,0) <= $${params.length}`;
  }

  // total
  const totalSql = `SELECT COUNT(*)::int AS cnt FROM reservations ${where}`;
  const total = (await pool.query(totalSql, params)).rows[0].cnt;

  // data
  const dataSql = `
    SELECT id, tg_username, name, phone, address, date, time,
           guests, comment, platform, created_at
    FROM reservations
    ${where}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const rows = (await pool.query(dataSql, [...params, lim, off])).rows;

  res.set("X-Total-Count", String(total));
  res.json({ items: rows, total });
};

/** POST /api/reserves */
exports.create = async (req, res) => {
  const {
    tg_username = null,
    name = null,
    phone = null,
    address = null,
    date = null,
    time = null,
    guests = null,
    comment = null, // platform не сохраняли
  } = req.body || {};
  const { rows } = await pool.query(
    `INSERT INTO reservations (tg_username,name,phone,address,date,time,guests,comment,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
     RETURNING id, tg_username, name, phone, address, date, time, guests, comment, created_at`,
    [tg_username, name, phone, address, date, time, guests, comment]
  );
  res.json(rows[0]);
};

/** PUT /api/reserves/:id */
exports.update = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "id must be number" });
  }
  const {
    tg_username,
    name,
    phone,
    address,
    date,
    time,
    guests,
    comment, // platform отсутствует
  } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE reservations SET
      tg_username=COALESCE($2,tg_username),
      name=COALESCE($3,name),
      phone=COALESCE($4,phone),
      address=COALESCE($5,address),
      date=COALESCE($6,date),
      time=COALESCE($7,time),
      guests=COALESCE($8,guests),
      comment=COALESCE($9,comment)
     WHERE id=$1
     RETURNING id, tg_username, name, phone, address, date, time, guests, comment, created_at`,
    [id, tg_username, name, phone, address, date, time, guests, comment]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

/** DELETE /api/reserves/:id */
exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "id must be number" });
  }
  const { rowCount } = await pool.query(`DELETE FROM reservations WHERE id=$1`, [
    id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, id });
};
