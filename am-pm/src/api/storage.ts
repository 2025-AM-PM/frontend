function readJSON<T>(key: string): T | null {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}

export const StorageKeys = {
  access: "access_token",
  user: "user_profile",
} as const;

// Access Token
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(StorageKeys.access);
  } catch {
    return null;
  }
}
export function setAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem(StorageKeys.access, token);
    else {
      localStorage.removeItem(StorageKeys.access);
    }
  } catch {}
}
export function hasAccessToken() {
  return !!getAccessToken();
}

export function getStoredUser<T>(): T | null {
  return readJSON<T>(StorageKeys.user);
}
export function setStoredUser<T>(u: T | null) {
  try {
    if (u) localStorage.setItem(StorageKeys.user, JSON.stringify(u));
    else localStorage.removeItem(StorageKeys.user);
  } catch {}
}
