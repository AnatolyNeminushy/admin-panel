// server/routes/auth.routes.js
const { Router } = require('express');
const router = Router();

const { login, me } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

const pass = (req, res, next) => next();
const maybeAuth =
  typeof auth === 'function'
    ? auth(false) // как и хотел: токен опционален
    : pass;

router.post('/login', login);
router.get('/me', maybeAuth, me);

module.exports = router;
