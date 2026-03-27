import type { LoginRole } from "./api/auth";

type Session = {
  token: string;
  role: LoginRole;
  companyName?: string;
};

const KEY = "anchordoc.session";

export function setSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function requireRole(roles: LoginRole[]) {
  const session = getSession();
  return !!session && roles.includes(session.role);
}
