// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Секрет подписи JWT.
 * Для разработки допустим дефолт, в продакшене должен быть задан через ENV.
 */
const SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Время жизни токена. Может быть числом (секунды) или строкой ("7d", "1h").
 * Если переменная не задана — токен будет без срока истечения (exp),
 * что корректно для jwt.sign при отсутствии опции expiresIn.
 */
const EXPIRES_IN = process.env.JWT_EXPIRES;

/**
 * Подпись полезной нагрузки в JWT.
 * @param {object} payload - данные пользователя (id, email, role и т.п.)
 * @returns {string} токен
 */
exports.sign = (payload) => {
  return EXPIRES_IN
    ? jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
    : jwt.sign(payload, SECRET);
};

/**
 * Валидация/декодирование JWT.
 * Бросает ошибку, если подпись неверна или токен истёк.
 * @param {string} token
 * @returns {object} расшифрованный payload
 */
exports.verify = (token) => jwt.verify(token, SECRET);
