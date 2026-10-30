import { type LoginResponse, type Role } from './data';

export interface SessionUser { id: string; name: string; email: string; role: Role }

export namespace Session {
  const KEY = 'bb-session';
  interface Stored { token: string; user: SessionUser; exp: number }

  function read(): Stored | null {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null') as Stored | null; } catch { return null; }
  }
  const live = (s: Stored | null): Stored | null => (s && s.exp > Date.now() ? s : null);

  function payload(token: string): { name?: string; exp?: number } {
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part), c => c.charCodeAt(0)))) as { name?: string; exp?: number };
    } catch { return {}; }
  }

  export const token = (): string | null => live(read())?.token ?? null;
  export const user = (): SessionUser | null => live(read())?.user ?? null;
  // The last signed-in user, even after the token expired. Used to prefill sign-in again.
  export const last = (): SessionUser | null => read()?.user ?? null;
  export const stale = (): boolean => !!read() && !user();

  export function start(res: LoginResponse): SessionUser {
    const p = payload(res.accessToken);
    const u: SessionUser = { id: res.user.id, email: res.user.email, role: res.user.role, name: p.name || res.user.email };
    const stored: Stored = { token: res.accessToken, user: u, exp: p.exp ? p.exp * 1000 : Number.MAX_SAFE_INTEGER };
    try { localStorage.setItem(KEY, JSON.stringify(stored)); } catch {  }
    return u;
  }

  export function clear(): void {
    try { localStorage.removeItem(KEY); } catch {  }
  }
}
