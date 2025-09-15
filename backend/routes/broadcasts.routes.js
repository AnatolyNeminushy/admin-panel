const router = require("express").Router();
const asyncH = require("../utils/asyncH"); // важно: без {}
const { sendBroadcast, preview } = require("../controllers/broadcasts.controller");

router.get("/recipients", asyncH(preview)); // предпросмотр получателей
router.post("/", asyncH(sendBroadcast));    // отправка/тест

module.exports = router;
