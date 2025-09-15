// server/controllers/messages.controller.js
const pool = require("../db");
const { getRange } = require("../utils/period"); // если понадобится
// таблица/диалог — как в исходнике

exports.list = async (req, res) => {
  const tableMode = String(req.query.table || "") === "1";
  if (!tableMode) {
    const chatId = Number(req.query.chatId);
    if (!Number.isFinite(chatId)) {
      return res.status(400).json({ error: "chatId is required and must be a number" });
    }
    const { limit = "500", offset = "0" } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 500, 1000);
    const off = Math.max(parseInt(offset, 10) || 0, 0);

    const sql = `
      SELECT * FROM (
        SELECT id, chat_id, from_me, text, date
        FROM messages
        WHERE chat_id = $1
        ORDER BY date DESC, id DESC
        LIMIT $2 OFFSET $3
      ) t
      ORDER BY date ASC, id ASC;
    `;
    const { rows } = await pool.query(sql, [chatId, lim, off]);
    return res.json(rows);
  }

  const { limit = "50", offset = "0", q = "" } = req.query;
  const lim = Math.min(parseInt(limit, 10) || 50, 1000);
  const off = Math.max(parseInt(offset, 10) || 0, 0);

  const params = [];
  let where = "";
  if (q) {
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    where = `
      WHERE m.text ILIKE $1
         OR c.username ILIKE $2
         OR CONCAT(COALESCE(c.first_name,''),' ',COALESCE(c.last_name,'')) ILIKE $3
    `;
  }

  const totalSql = `
    SELECT COUNT(*)::int AS cnt
    FROM messages m
    LEFT JOIN chats c ON c.chat_id = m.chat_id
    ${where}
  `;
  const total = (await pool.query(totalSql, params)).rows[0].cnt;

  const dataSql = `
    SELECT m.id, m.chat_id, m.from_me, m.text, m.date,
           c.username, c.first_name, c.last_name, c.platform
    FROM messages m
    LEFT JOIN chats c ON c.chat_id = m.chat_id
    ${where}
    ORDER BY m.date DESC, m.id DESC
    LIMIT ${lim} OFFSET ${off}
  `;
  const rows = (await pool.query(dataSql, params)).rows;

  res.set("X-Total-Count", String(total));
  res.json({ items: rows, total });
};

exports.createRaw = async (req, res) => {
  const { chat_id, text, from_me = false, date = null } = req.body || {};
  if (!chat_id || !text)
    return res.status(400).json({ error: "chat_id and text are required" });
  const { rows } = await pool.query(
    `INSERT INTO messages (chat_id, from_me, text, date)
     VALUES ($1,$2,$3,COALESCE($4, NOW()))
     RETURNING id, chat_id, from_me, text, date`,
    [chat_id, !!from_me, String(text), date]
  );
  res.json(rows[0]);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "id must be number" });
  const { text, from_me, date } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE messages
     SET text = COALESCE($2, text),
         from_me = COALESCE($3, from_me),
         date = COALESCE($4, date)
     WHERE id=$1
     RETURNING id, chat_id, from_me, text, date`,
    [id, text ?? null, typeof from_me === "boolean" ? from_me : null, date ?? null]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }
  const { rowCount } = await pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, id });
};
