// server/routes/orders.routes.js
const router = require("express").Router();
const asyncH = require("../utils/asyncH");
const orders = require("../controllers/orders.controller");

// GET /api/orders            (list + table=1 режим)
router.get("/", asyncH(orders.list));

// POST /api/orders           (create)
router.post("/", asyncH(orders.create));

// PUT /api/orders/:id        (update)
router.put("/:id", asyncH(orders.update));

// DELETE /api/orders/:id     (delete)
router.delete("/:id", asyncH(orders.remove));

module.exports = router;
