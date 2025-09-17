// routes/events.routes.js
const router = require('express').Router();
const { sseHandler } = require('../utils/events');

// Server-Sent Events endpoint
router.get('/', sseHandler);

module.exports = router;

