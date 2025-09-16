// routes/chats.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH');
const c = require('../controllers/chats.controller');

/**
 * GET /chats
 * Список чатов (с пагинацией/фильтрами — если реализовано в контроллере)
 */
router.get('/', asyncH(c.list));

/**
 * POST /chats
 * Создание или upsert чата (в зависимости от контроллера)
 */
router.post('/', asyncH(c.createOrUpsert));

/**
 * PUT /chats/:chat_id
 * Обновление чата
 */
router.put('/:chat_id', asyncH(c.update));

/**
 * DELETE /chats/:chat_id
 * Удаление чата
 */
router.delete('/:chat_id', asyncH(c.remove));

module.exports = router;
