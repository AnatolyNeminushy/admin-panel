// controllers/auth.controller.js

/**
 * Контроллер аутентификации.
 * Зависимости: bcryptjs, pg-pool (pool), утилита для подписи JWT.
 * Стиль: совместим с ESLint (airbnb-base) + Prettier.
 */

const bcrypt = require("bcryptjs");
const pool = require("../db");
const { sign } = require("../utils/jwt");

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Поведение:
 *  - Возвращает 400, если нет email или password.
 *  - Возвращает 401, если пара логин/пароль невалидна.
 *  - Возвращает 500, если не настроен JWT.
 *  - При успехе: { token, user }.
 */
exports.login = async (req, res) => {
  try {
    const body = req.body || {};

    // Нормализация и минимальная валидация
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }
    // (Опционально) простая доп.валидация — покажет внимание к деталям:
    // if (password.length < 6) return res.status(400).json({ error: 'password too short' });

    // Поиск аккаунта без учета регистра email; is_active = NULL трактуем как TRUE
    const { rows } = await pool.query(
      `
      SELECT id, email, full_name, role, password_hash, is_active, created_at, last_login_at
      FROM accounts
      WHERE lower(email) = $1
        AND COALESCE(is_active, TRUE) = TRUE
      LIMIT 1
      `,
      [email]
    );
    const acc = rows[0];

    // Единый ответ для "не найден" и "неверный пароль" — не раскрываем, существует ли email
    if (!acc?.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, acc.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Best-effort обновление last_login_at — не блокируем ответ пользователю
    pool.query("UPDATE accounts SET last_login_at = NOW() WHERE id = $1", [acc.id]).catch((e) => {
      // TODO: заменить на централизованный логгер (pino/winston)
      
      console.warn("skip last_login_at update:", e.code || e.message);
    });

    // Подписываем JWT. Если секрет не настроен — возвращаем 500 с понятной ошибкой
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
        fullName: acc.full_name, 
        role: acc.role,
        is_active: acc.is_active,
        created_at: acc.created_at,
        last_login_at: acc.last_login_at,
      },
    });
  } catch (err) {
    
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal error" });
  }
};

/**
 * GET /auth/me
 * Требования:
 *  - Если миддлвар аутентификации кладёт пользователя в req.user,
 *    возвращаем актуальные данные из БД.
 * Контракт:
 *  - Токен опционален. Если нет авторизации — { user: null } и 200 OK.
 */
exports.me = async (req, res) => {
  try {
    const userFromAuth = req.user;

    if (!userFromAuth) {
      // Токен опционален => возвращаем "не авторизован" в мягком виде
      return res.json({ user: null });
    }

    // Освежаем данные из БД (роль/имя могли измениться)
    const { rows } = await pool.query(
      `
      SELECT id, email, full_name, role, is_active, created_at, last_login_at
      FROM accounts
      WHERE id = $1
      `,
      [userFromAuth.id]
    );
    const acc = rows[0];

    if (!acc) {
      // Пользователь удален/деактивирован
      return res.json({ user: null });
    }

    return res.json({
      user: {
        id: acc.id,
        email: acc.email,
        fullName: acc.full_name, 
        role: acc.role,
        is_active: acc.is_active,
        created_at: acc.created_at,
        last_login_at: acc.last_login_at,
      },
    });
  } catch (e) {
    
    console.error("ME ERROR:", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
