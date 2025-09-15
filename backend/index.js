// server/index.js
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv-flow').config(); // читаем .env* ТОЛЬКО в dev
  } catch (e) {
    console.warn('[dotenv-flow] skipped in dev:', e?.message);
  }
}

const app = require('./app');

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
