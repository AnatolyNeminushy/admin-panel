// // server/telegram.js
// const TelegramBot = require("node-telegram-bot-api");
// const pool = require("./db");
// require("dotenv").config();

// const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   // Сохраняем чат (если нет)
//   await pool.query(
//     `
//         INSERT INTO chats (chat_id, username, first_name, last_name)
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (chat_id) DO NOTHING
//     `,
//     [chatId, msg.from.username, msg.from.first_name, msg.from.last_name]
//   );

//   // Сохраняем сообщение
//   await pool.query(
//     `
//         INSERT INTO messages (chat_id, from_me, text, date)
//         VALUES ($1, $2, $3, NOW())
//     `,
//     [chatId, false, msg.text]
//   );

//   // (опционально) автоматический ответ
//   // bot.sendMessage(chatId, "Спасибо за сообщение! Оператор скоро ответит.");
// });

// async function sendMessageToUser(chatId, text) {
//   await pool.query(
//     `
//         INSERT INTO messages (chat_id, from_me, text, date)
//         VALUES ($1, $2, $3, NOW())
//     `,
//     [chatId, true, text]
//   );
//   return bot.sendMessage(chatId, text);
// }

// module.exports = { bot, sendMessageToUser };
