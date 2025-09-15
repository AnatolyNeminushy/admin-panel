const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

app.use('/health', require('./routes/health.routes'));
app.use('/api/chats', require('./routes/chats.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/stat', require('./routes/stats.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reserves', require('./routes/reserves.routes'));
app.use('/api/broadcasts', require('./routes/broadcasts.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
