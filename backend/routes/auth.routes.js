// routes/auth.routes.js
const { Router } = require('express');
const { login, me } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

const router = Router();

/**
 * middleware, который игнорируется, если auth недоступен;
 * иначе вызываем auth(false) — токен опционален
 */
const pass = (req, res, next) => next();
const maybeAuth = typeof auth === 'function' ? auth(false) : pass;

/**
 * POST /auth/login
 * Аутентификация по email/password
 */
router.post('/login', login);

/**
 * GET /auth/me
 * Возвращает текущего пользователя (если токен валиден),
 * иначе { user: null }
 */
router.get('/me', maybeAuth, me);

module.exports = router;
