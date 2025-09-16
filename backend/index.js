// index.js
// Точка входа бэкенда: загрузка .env в dev и запуск HTTP-сервера.

if (process.env.NODE_ENV !== 'production') {
  try {
    // В разработке читаем переменные из .env* файлов 
    // (dotenv-flow поддерживает .env.local и т.д.)
    require('dotenv-flow').config();
  } catch (e) {
    console.warn('[dotenv-flow] skipped in dev:', e?.message);
  }
}

const app = require('./app');

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
