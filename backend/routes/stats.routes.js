// routes/stats.routes.js
const router = require('express').Router();
const asyncH = require('../utils/asyncH');
const s = require('../controllers/stats.controller');

/**
 * GET /stats/orders
 * Сводная статистика по заказам
 */
router.get('/orders', asyncH(s.ordersTotal));

/**
 * GET /stats/reserves
 * Сводная статистика по броням
 */
router.get('/reserves', asyncH(s.reservesTotal));

/**
 * GET /stats/orders-sum
 * Сумма заказов (например, за период)
 */
router.get('/orders-sum', asyncH(s.ordersSum));

/**
 * GET /stats/orders-extra
 * Дополнительные метрики по заказам
 */
router.get('/orders-extra', asyncH(s.ordersExtra));

/**
 * GET /stats/orders-by-day
 * Дневная агрегированная статистика по заказам
 */
router.get('/orders-by-day', asyncH(s.ordersByDay));

/**
 * GET /stats/reserves-by-day
 * Дневная агрегированная статистика по броням
 */
router.get('/reserves-by-day', asyncH(s.reservesByDay));

module.exports = router;
