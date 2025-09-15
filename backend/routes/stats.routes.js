// server/routes/stats.routes.js
const router = require("express").Router();
const asyncH = require("../utils/asyncH");
const s = require("../controllers/stats.controller");

router.get("/orders", asyncH(s.ordersTotal));
router.get("/reserves", asyncH(s.reservesTotal));
router.get("/orders-sum", asyncH(s.ordersSum));
router.get("/orders-extra", asyncH(s.ordersExtra));
router.get("/orders-by-day", asyncH(s.ordersByDay));
router.get("/reserves-by-day", asyncH(s.reservesByDay));

module.exports = router;
