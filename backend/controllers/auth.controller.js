// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { sign } = require("../utils/jwt");

exports.login = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }

    // ищем без регистрозависимости и считаем NULL как активный (если в схеме так)
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, password_hash
       FROM accounts
       WHERE lower(email) = $1 AND COALESCE(is_active, TRUE) = TRUE
       LIMIT 1`,
      [email]
    );
    const acc = rows[0];

    if (!acc?.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, acc.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // best-effort: не валим логин, если нет колонки last_login_at
    pool
      .query("UPDATE accounts SET last_login_at = NOW() WHERE id = $1", [acc.id])
      .catch((e) => {
        console.warn("skip last_login_at update:", e.code || e.message);
      });

    // подпись токена (чтобы не падать без секрета — вернём 500 с понятной ошибкой)
    let token;
    try {
      token = sign({ id: acc.id, email: acc.email, role: acc.role });
    } catch (e) {
      console.error("JWT sign error:", e);
      return res.status(500).json({ error: "JWT is not configured" });
    }

    return res.json({
      token,
      user: {
        id: acc.id,
        email: acc.email,
        full_name: acc.full_name,
        role: acc.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal error" });
  }
};
exports.me = async (req, res) => {
  try {
    // если миддлварь auth раскладывает пользователя в req.user — используем его
    const userFromAuth = req.user;

    if (!userFromAuth) {
      // токен опционален => просто вернём user: null
      return res.json({ user: null });
    }

    // на всякий случай обновим данные из БД
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role
       FROM accounts
       WHERE id = $1`,
      [userFromAuth.id]
    );
    const acc = rows[0];
    if (!acc) return res.json({ user: null });

    return res.json({
      user: {
        id: acc.id,
        email: acc.email,
        full_name: acc.full_name,
        role: acc.role,
      },
    });
  } catch (e) {
    console.error("ME ERROR:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};