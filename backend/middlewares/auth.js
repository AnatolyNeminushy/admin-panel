// middlewares/auth.js

/**
 * Аутентификация по JWT в заголовке Authorization: Bearer <token>.
 * @param {boolean} required - Если true, отклоняет запрос без токена/с неверным токеном (401).
 *                             Если false, пропускает дальше с req.user = null.
 * @returns {import('express').RequestHandler}
 */
const { verify } = require('../utils/jwt');

function auth(required = true) {
  return (req, res, next) => {
    // Достаём токен из заголовка Authorization в формате "Bearer <token>"
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Если токена нет
    if (!token) {
      if (required) {
        return res.status(401).json({ error: 'No token' });
      }
      req.user = null; // гостевой доступ
      return next();
    }

    try {
      // Проверяем и декодируем JWT → кладём полезную нагрузку в req.user
      const payload = verify(token);
      // payload ожидается вида: { id, email, role }
      req.user = payload;
      return next();
    } catch (e) {
      console.warn('[auth] verify failed:', e.name, e.message);

      if (required) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = null; // при optional-режиме даём пройти без пользователя
      return next();
    }
  };
}

module.exports = auth;
