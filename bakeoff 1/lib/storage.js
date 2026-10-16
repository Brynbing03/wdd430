export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function readStorage(storage, key, fallback, isValid = () => true) {
  try {
    const rawValue = storage?.getItem(key);
    if (rawValue === null) return fallback;

    const parsedValue = JSON.parse(rawValue);
    return isValid(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(storage, key, value) {
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const isArray = (value) => Array.isArray(value);
export const isPlan = isPlainObject;
