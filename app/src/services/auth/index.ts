import { authEnabled, config } from '../../config';
import { DemoAuth } from './demo';
import type { AuthService, SyncService } from './types';

export type { AuthService, AuthUser, SyncService, SyncSnapshot, AuthResult } from './types';

/** Accounts are OFF unless EXPO_PUBLIC_SUPABASE_URL and _ANON_KEY are set. */
class GuestOnly implements AuthService {
  readonly enabled = false;
  async getUser() {
    return null;
  }
  async sendCode() {
    return { ok: false };
  }
  async verifyCode() {
    return { ok: false };
  }
  async appleAvailable() {
    return false;
  }
  async signInWithApple() {
    return { ok: false };
  }
  async googleAvailable() {
    return false;
  }
  async signInWithGoogle() {
    return { ok: false };
  }
  async signOut() {}
  async deleteAccount() {
    return { ok: false };
  }
  onChange() {
    return () => {};
  }
}

let authImpl: AuthService = config.demoAuth ? new DemoAuth() : new GuestOnly();
let syncImpl: SyncService | null = null;

if (authEnabled) {
  // Loaded only when configured so guest builds never touch Supabase.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('./supabase') as typeof import('./supabase');
  authImpl = new mod.SupabaseAuth();
  syncImpl = new mod.SupabaseSync();
}

export const auth = authImpl;
export const sync = syncImpl;
