// server/routes/reserves.routes.js
const router = require("express").Router();
const asyncH = require("../utils/asyncH");
const reserves = require("../controllers/reserves.controller");

// GET /api/reserves          (list + table=1 режим)
router.get("/", asyncH(reserves.list));

// POST /api/reserves         (create)
router.post("/", asyncH(reserves.create));

// PUT /api/reserves/:id      (update)
router.put("/:id", asyncH(reserves.update));

// DELETE /api/reserves/:id   (delete)
router.delete("/:id", asyncH(reserves.remove));

module.exports = router;
