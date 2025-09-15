// src/utils/chatUtils.js
export const getDialogTimestamp = (dlg) => {
  const raw =
    dlg?.last_ts ||
    dlg?.last_message_date ||
    dlg?.lastMessageAt ||
    dlg?.updated_at ||
    dlg?.updatedAt ||
    dlg?.last_activity ||
    dlg?.lastActivity ||
    dlg?.lastMessage?.date ||
    null;
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};

export const matchesLocal = (dlg, term) => {
  if (!term) return true;
  const t = term.toLowerCase();
  return (
    String(dlg.username || "").toLowerCase().includes(t) ||
    String(dlg.first_name || "").toLowerCase().includes(t) ||
    String(dlg.last_name || "").toLowerCase().includes(t) ||
    String(dlg.chat_id || "").toLowerCase().includes(t)
  );
};
