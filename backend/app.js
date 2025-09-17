// app.js
// Основной экземпляр приложения Express: 
// общие middlewares, маршруты и стандартные обработчики ошибок.

const express = require('express');
const cors = require('cors');

const app = express();

/**
 * CORS: разрешаем запросы с фронтенда/инструментов.
 * Значение берётся из переменной окружения CORS_ORIGIN,
 * по умолчанию — '*' (все источники), что удобно для разработки.
 */
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

/**
 * JSON body parser: принимаем JSON-тела до 1 МБ.
 * Если нужно больше — увеличить лимит.
 */
app.use(express.json({ limit: '1mb' }));

// Отключаем кэширование, чтобы списки после изменений не брались из кеша
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

/**
 * Подключение модулей маршрутов.
 * Каждый файл внутри ./routes экспортирует Router с эндпоинтами своей области.
 */
app.use('/health', require('./routes/health.routes'));
app.use('/api/chats', require('./routes/chats.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/stat', require('./routes/stats.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reserves', require('./routes/reserves.routes'));
app.use('/api/broadcasts', require('./routes/broadcasts.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/events', require('./routes/events.routes'));

/**
 * 404 Not Found: если маршрут не найден — возвращаем единый JSON-ответ.
 */
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

/**
 * Централизованный обработчик ошибок Express.
 * Логируем и отправляем унифицированный ответ в формате { error: string }.
 */
function apiErrorHandler(err, req, res, _next) {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
app.use(apiErrorHandler);

module.exports = app;
