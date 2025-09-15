// server/routes/chats.routes.js
const router = require("express").Router();
const asyncH = require("../utils/asyncH");
const c = require("../controllers/chats.controller");

router.get("/", asyncH(c.list));
router.post("/", asyncH(c.createOrUpsert));
router.put("/:chat_id", asyncH(c.update));
router.delete("/:chat_id", asyncH(c.remove));

module.exports = router;
