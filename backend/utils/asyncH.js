// utils/asyncH.js

/**
 * Обёртка для асинхронных контроллеров Express.
 * Перехватывает отклонённые промисы и передаёт ошибку в next(),
 * чтобы сработал централизованный error handler.
 *
 * Пример:
 *   router.get('/route', asyncH(async (req, res) => { ... }));
 */
function asyncH(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Экспорт: по умолчанию и именованный
module.exports = asyncH;        // default
module.exports.asyncH = asyncH; // named
