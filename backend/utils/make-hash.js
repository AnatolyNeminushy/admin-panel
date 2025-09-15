// server/utils/make-hash.js
const bcrypt = require('bcryptjs');
(async () => {
  const hash = await bcrypt.hash('12345678', 10); // замени на свой пароль
  console.log(hash);
})();
