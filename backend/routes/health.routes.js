// server/routes/health.routes.js
const router = require("express").Router();
router.get("/", (_req, res) => res.json({ ok: true }));
module.exports = router;
