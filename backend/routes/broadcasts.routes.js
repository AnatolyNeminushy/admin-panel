// routes/broadcasts.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH'); // хелпер-обёртка для async-контроллеров
const { sendBroadcast, preview } = require('../controllers/broadcasts.controller');

/**
 * GET /broadcasts/recipients
 * Возвращает предпросмотр получателей рассылки с учётом фильтров
 */
router.get('/recipients', asyncH(preview));

/**
 * POST /broadcasts
 * Запуск рассылки / отправка тестового сообщения
 */
router.post('/', asyncH(sendBroadcast));

module.exports = router;
