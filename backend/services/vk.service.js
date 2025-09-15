// server/services/vk.service.js
exports.sendVkMessage = async (peer_id, text) => {
  const params = new URLSearchParams({
    v: "5.131",
    access_token: process.env.VK_TOKEN,
    peer_id: String(peer_id),
    random_id: String(Math.floor(Math.random() * 1e9)),
    message: text,
  });
  const res = await fetch("https://api.vk.com/method/messages.send", {
    method: "POST",
    body: params,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.error_msg || "VK send failed");
  return new Date().toISOString();
};
