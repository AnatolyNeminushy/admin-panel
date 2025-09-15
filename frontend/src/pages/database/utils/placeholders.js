export const PLACEHOLDER_MIN = -900_000_000_000_000;

export const isPlaceholderId = (id) =>
  typeof id === "number" && id <= PLACEHOLDER_MIN;

export const makePlaceholderId = () => PLACEHOLDER_MIN - Date.now();
