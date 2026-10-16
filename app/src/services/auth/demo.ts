import type { AuthResult, AuthService, AuthUser } from './types';

/**
 * Preview-only accounts: every sign-in "works" and nothing leaves the browser.
 * Lets a reviewer walk the sign-up and log-in screens without a server.
 */
export class DemoAuth implements AuthService {
  readonly enabled = true;
  readonly demo = true;
  private user: AuthUser | null = null;
  private subs = new Set<(u: AuthUser | null) => void>();
  private set(u: AuthUser | null) {
    this.user = u;
    this.subs.forEach((cb) => cb(u));
  }
  async getUser() {
    return this.user;
  }
  async sendCode(email: string): Promise<AuthResult> {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { ok: true } : { ok: false, error: 'errors.emailInvalid' };
  }
  async verifyCode(email: string, code: string): Promise<AuthResult> {
    if (!/^\d{6}$/.test(code)) return { ok: false, error: 'errors.codeWrong' };
    this.set({ id: 'demo-' + email, email });
    return { ok: true };
  }
  async appleAvailable() {
    return true;
  }
  async signInWithApple(): Promise<AuthResult> {
    this.set({ id: 'demo-apple', email: 'parent@privaterelay.appleid.com' });
    return { ok: true };
  }
  async googleAvailable() {
    return true;
  }
  async signInWithGoogle(): Promise<AuthResult> {
    this.set({ id: 'demo-google', email: 'parent@gmail.com' });
    return { ok: true };
  }
  async signOut() {
    this.set(null);
  }
  async deleteAccount(): Promise<AuthResult> {
    this.set(null);
    return { ok: true };
  }
  onChange(cb: (u: AuthUser | null) => void) {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }
}
