// routes/messages.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH');
const c = require('../controllers/messages.controller');
const { sendOperatorMessage } = require('../services/send.service');

/**
 * GET /messages
 * Список сообщений
 */
router.get('/', asyncH(c.list));

/**
 * POST /messages/raw
 * Приём «сырых» сообщений (интеграции/вебхуки)
 * Итоговый URL будет /api/messages/raw, если роутер смонтирован на /api/messages
 */
router.post('/raw', asyncH(c.createRaw));

/**
 * PUT /messages/:id
 * Обновление сообщения (например, статуса)
 */
router.put('/:id', asyncH(c.update));

/**
 * DELETE /messages/:id
 * Удаление сообщения
 */
router.delete('/:id', asyncH(c.remove));

/**
 * POST /messages
 * Отправка сообщения от оператора гостю
 * Body: { chatId: string|number, text: string }
 */
router.post(
  '/',
  asyncH(async (req, res) => {
    const { chatId, text } = req.body || {};
    if (!chatId || !text || String(text).trim() === '') {
      return res.status(400).json({ error: 'chatId and text are required' });
    }

    try {
      const result = await sendOperatorMessage({ chatId, text });
      if (result.status !== 200) {
        return res.status(result.status).json({ error: result.error });
      }
      return res.json(result.data);
    } catch (e) {
      // Логируем и возвращаем «шлюз» ошибку, если внешний сервис недоступен
      console.error('Send error:', e);
      return res.status(502).json({ error: 'Upstream send failed' });
    }
  }),
);

module.exports = router;
