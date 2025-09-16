// routes/orders.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH');
const orders = require('../controllers/orders.controller');

/**
 * GET /orders
 * Возвращает список заказов (поддержка режима table=1 — на усмотрение контроллера)
 */
router.get('/', asyncH(orders.list));

/**
 * POST /orders
 * Создание заказа
 */
router.post('/', asyncH(orders.create));

/**
 * PUT /orders/:id
 * Обновление заказа
 */
router.put('/:id', asyncH(orders.update));

/**
 * DELETE /orders/:id
 * Удаление заказа
 */
router.delete('/:id', asyncH(orders.remove));

module.exports = router;
