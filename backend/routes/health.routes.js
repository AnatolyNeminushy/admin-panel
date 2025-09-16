// routes/health.routes.js
const router = require("express").Router();

/**
 * GET /health
 * Простой healthcheck приложения
 */
router.get("/", (_req, res) => res.json({ ok: true }));

module.exports = router;
