// pages/database/utils/placeholders.js
// Очень маленькое (отрицательное) значение для временных ID, чтобы не пересекаться с реальными.
// Используется, когда оператор создаёт записи без известного реального идентификатора.
export const PLACEHOLDER_MIN = -900_000_000_000_000;

// Проверяет, является ли идентификатор временным placeholder'ом
export const isPlaceholderId = (id) => typeof id === 'number' && id <= PLACEHOLDER_MIN;

// Генерирует уникальный временный ID (чем дальше по времени, тем меньше значение)
export const makePlaceholderId = () => PLACEHOLDER_MIN - Date.now();
