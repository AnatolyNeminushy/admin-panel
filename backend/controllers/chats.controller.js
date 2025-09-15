// server/controllers/chats.controller.js
const pool = require("../db");

exports.list = async (req, res) => {
  const { limit = "100", offset = "0", q = "" } = req.query;
  const lim = Math.min(parseInt(limit, 10) || 100, 5000);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  const params = [];
  let i = 1;

  let whereChats = "";
  if (q) {
    whereChats = `
      WHERE coalesce(c.username,'') ILIKE $${i}
         OR coalesce(c.first_name,'') ILIKE $${i}
         OR coalesce(c.last_name,'') ILIKE $${i}
    `;
    params.push(`%${q}%`);
    i++;
  }

  const countSql = `
    WITH base AS (
      SELECT c.chat_id
      FROM chats c
      ${whereChats}
      GROUP BY c.chat_id
    ) SELECT COUNT(*)::int AS total FROM base
  `;

  const listSql = `
    WITH base AS (
      SELECT c.chat_id,
             max(c.username) AS username,
             max(c.first_name) AS first_name,
             max(c.last_name)  AS last_name,
             max(c.platform)   AS platform
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
      SELECT b.chat_id, b.username, b.first_name, b.last_name, b.platform, lm.last_ts
      FROM base b LEFT JOIN last_msg lm ON lm.chat_id = b.chat_id
    )
    SELECT * FROM merged
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
    res.set("X-Total-Count", String(total));
    res.json({ items: listRows, total });
  } finally {
    client.release();
  }
};

exports.createOrUpsert = async (req, res) => {
  const {
    chat_id,
    username = null,
    first_name = null,
    last_name = null,
    platform = null,
  } = req.body || {};
  if (!chat_id || !Number.isFinite(Number(chat_id))) {
    return res.status(400).json({ error: "chat_id (number) is required" });
  }
  const sql = `
    INSERT INTO chats (chat_id, username, first_name, last_name, platform)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (chat_id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name  = EXCLUDED.last_name,
      platform   = EXCLUDED.platform
    RETURNING chat_id, username, first_name, last_name, platform
  `;
  const { rows } = await pool.query(sql, [
    chat_id,
    username,
    first_name,
    last_name,
    platform,
  ]);
  res.json(rows[0]);
};

exports.update = async (req, res) => {
  const chat_id = Number(req.params.chat_id);
  if (!Number.isFinite(chat_id))
    return res.status(400).json({ error: "chat_id must be number" });
  const {
    username = null,
    first_name = null,
    last_name = null,
    platform = null,
  } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE chats
     SET username=$2, first_name=$3, last_name=$4, platform=$5
     WHERE chat_id=$1
     RETURNING chat_id, username, first_name, last_name, platform`,
    [chat_id, username, first_name, last_name, platform]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

// server/controllers/chats.controller.js
exports.remove = async (req, res, next) => {
  const chatId = Number(req.params.chat_id);
  if (!Number.isFinite(chatId)) {
    return res.status(400).json({ error: "chat_id must be number" });
  }

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM chats WHERE chat_id = $1",
      [chatId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    // Сообщения удалятся автоматически благодаря ON DELETE CASCADE
    return res.status(204).end();
  } catch (e) {
    return next(e);
  }
};
