// utils/events.js
// Простой брокер событий для Server-Sent Events (SSE)

const { EventEmitter } = require('events');

// Храним подписчиков по топикам
// key: topic (e.g. 'orders', 'reservations', 'messages', 'chats', 'all')
// value: Set<res>
const subscribers = new Map();

const ALL = 'all';

function addSubscriber(topic, res) {
  if (!subscribers.has(topic)) subscribers.set(topic, new Set());
  subscribers.get(topic).add(res);
}

function removeSubscriber(topic, res) {
  const set = subscribers.get(topic);
  if (set) {
    set.delete(res);
    if (set.size === 0) subscribers.delete(topic);
  }
}

function broadcast(topic, data) {
  const line = `event: ${topic}\n` + `data: ${JSON.stringify(data || {})}\n\n`;

  // отправляем всем подписчикам топика
  const direct = subscribers.get(topic);
  if (direct) {
    for (const res of direct) {
      try { res.write(line); } catch { /* ignore */ }
    }
  }
  // и всем, кто слушает 'all'
  const all = subscribers.get(ALL);
  if (all) {
    for (const res of all) {
      try { res.write(line); } catch { /* ignore */ }
    }
  }
}

// SSE-обработчик: GET /api/events?topics=orders,messages
function sseHandler(req, res) {
  // заголовки SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Разрешить прокси не буферизовать
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  // подписываем на перечисленные топики
  const topicsParam = String(req.query.topics || ALL).trim();
  const topics = topicsParam
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  for (const t of topics) addSubscriber(t, res);

  // отправим привет и текущий список топиков
  res.write(`event: ready\n`);
  res.write(`data: ${JSON.stringify({ topics })}\n\n`);

  // ping, чтобы соединение не засыпало
  const ping = setInterval(() => {
    try { res.write(`event: ping\n` + `data: ${Date.now()}\n\n`); } catch {}
  }, 25000);

  // очистка на закрытие
  const onClose = () => {
    clearInterval(ping);
    for (const t of topics) removeSubscriber(t, res);
    try { res.end(); } catch {}
  };
  req.on('close', onClose);
  req.on('end', onClose);
}

module.exports = { sseHandler, broadcast, ALL };

