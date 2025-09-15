// server/routes/messages.routes.js
const router = require("express").Router();
const asyncH = require("../utils/asyncH");
const c = require("../controllers/messages.controller");
const { sendOperatorMessage } = require("../services/send.service");

router.get("/", asyncH(c.list));
router.post("/-raw", asyncH(c.createRaw)); // /api/messages-raw
router.put("/:id", asyncH(c.update));
router.delete("/:id", asyncH(c.remove));

// POST отправка оператором гостю (бывший /api/messages)
router.post(
  "/",
  asyncH(async (req, res) => {
    const { chatId, text } = req.body || {};
    if (!chatId || !text || String(text).trim() === "") {
      return res.status(400).json({ error: "chatId and text are required" });
    }
    try {
      const result = await sendOperatorMessage({ chatId, text });
      if (result.status !== 200) {
        return res.status(result.status).json({ error: result.error });
      }
      res.json(result.data);
    } catch (e) {
      console.error("Send error:", e);
      res.status(502).json({ error: "Upstream send failed" });
    }
  })
);

module.exports = router;
