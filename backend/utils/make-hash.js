#!/usr/bin/env node
// utils/make-hash.js
// Утилита для генерации bcrypt-хэша пароля.
// Запуск: node backend/utils/make-hash.js admin123

const bcrypt = require('bcryptjs');

(async () => {
  // Берём пароль из аргумента CLI; если не задан — выходим с подсказкой.
  const pwd = process.argv[2];
  if (!pwd) {
    console.error('Usage: node server/utils/make-hash.js <password>');
    process.exit(1);
  }

  // Генерируем хэш с 10 раундами соли (дефолт для большинства проектов).
  const hash = await bcrypt.hash(pwd, 10);

  // Печатаем готовый хэш — его можно вставить в базу.
  console.log(hash);
})();
