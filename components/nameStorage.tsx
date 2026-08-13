const STORAGE_KEY = "portfolio_cursor_name";
const REMEMBER_DAYS = 30;

export function loadStoredName(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { name, expiresAt } = JSON.parse(raw);
    return Date.now() > expiresAt ? null : name;
  } catch {
    return null;
  }
}

export function storeName(name: string) {
  const expiresAt = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, expiresAt }));
}
