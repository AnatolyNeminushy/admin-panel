// routes/reserves.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH');
const reserves = require('../controllers/reserves.controller');

/**
 * GET /reserves
 * Возвращает список броней (режим table=1 — на усмотрение контроллера)
 */
router.get('/', asyncH(reserves.list));

/**
 * POST /reserves
 * Создание брони
 */
router.post('/', asyncH(reserves.create));

/**
 * PUT /reserves/:id
 * Обновление брони
 */
router.put('/:id', asyncH(reserves.update));

/**
 * DELETE /reserves/:id
 * Удаление брони
 */
router.delete('/:id', asyncH(reserves.remove));

module.exports = router;
