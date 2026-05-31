import Cookies from "js-cookie";

const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, admin: unknown) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearAuthSession() {
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}
