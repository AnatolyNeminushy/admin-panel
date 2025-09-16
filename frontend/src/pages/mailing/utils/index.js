// pages/mailing/utils/index.js

/**
 * Безопасный JSON.parse — при ошибке вернёт null.
 */
export function safeJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Разбор вручную введённых ID пользователей.
 * Поддерживает разделители: пробел, запятая, точка с запятой, перенос строки.
 */
export function parseManualIds(input) {
  return String(input || '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(String);
}

/**
 * Проверка, можно ли отправлять рассылку.
 *  - В режиме "selected" требуется хотя бы один выбранный ID.
 *  - В остальных режимах нужна непустая строка сообщения и хотя бы одна платформа.
 */
export function canSend({ text = '', platforms = {}, sendMode, selectedIds }) {
  const anyPlatform = Boolean(platforms.tg || platforms.vk);
  if (sendMode === 'selected') return selectedIds?.size > 0;
  return text.trim().length > 0 && anyPlatform;
}
