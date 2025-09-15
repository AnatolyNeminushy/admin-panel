// server/services/telegram.service.js
exports.sendTelegramMessage = async (chat_id, text) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Telegram send failed");
  const ts = data.result?.date ? data.result.date * 1000 : Date.now();
  return new Date(ts).toISOString();
};
