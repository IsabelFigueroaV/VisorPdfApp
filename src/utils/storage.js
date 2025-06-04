export const setStorageWithExpiry = (key, value, ttlMs) => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getStorageWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};
