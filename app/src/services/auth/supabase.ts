import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';
import type { ChildData, ChildProfile, ClassProgress } from '../../types';
import { appleIdentityToken, appleSignInAvailable } from './apple';
import type { AuthResult, AuthService, AuthUser, SyncService, SyncSnapshot } from './types';

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
    });
  }
  return client;
}

const toUser = (u: { id: string; email?: string } | null | undefined): AuthUser | null => (u ? { id: u.id, email: u.email } : null);

export class SupabaseAuth implements AuthService {
  readonly enabled = true;
  async getUser() {
    const { data } = await sb().auth.getSession();
    return toUser(data.session?.user);
  }
  async sendCode(email: string): Promise<AuthResult> {
    // The Supabase email template must include {{ .Token }} (6-digit code), see README.
    const { error } = await sb().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (!error) return { ok: true };
    return { ok: false, error: /rate|too many/i.test(error.message) ? 'errors.tooManyCodes' : 'errors.emailInvalid' };
  }
  async verifyCode(email: string, code: string): Promise<AuthResult> {
    const { error } = await sb().auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    if (!error) return { ok: true };
    return { ok: false, error: /expired/i.test(error.message) ? 'errors.codeExpired' : 'errors.codeWrong' };
  }
  appleAvailable() {
    return appleSignInAvailable();
  }
  async signInWithApple(): Promise<AuthResult> {
    const token = await appleIdentityToken();
    if (!token) return { ok: false };
    const { error } = await sb().auth.signInWithIdToken({ provider: 'apple', token });
    return error ? { ok: false, error: 'errors.genericBody' } : { ok: true };
  }
  async signOut() {
    await sb().auth.signOut();
  }
  async deleteAccount(): Promise<AuthResult> {
    // SECURITY DEFINER function in supabase/schema.sql deletes auth.users row -> cascades.
    const { error } = await sb().rpc('delete_my_account');
    if (error) return { ok: false, error: 'errors.deleteFailed' };
    await sb().auth.signOut();
    return { ok: true };
  }
  onChange(cb: (u: AuthUser | null) => void) {
    const { data } = sb().auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }
}

export class SupabaseSync implements SyncService {
  async push(user: AuthUser, snap: SyncSnapshot) {
    const db = sb();
    await db.from('profiles').upsert({ id: user.id, email: user.email ?? null });
    if (snap.children.length) {
      await db.from('children').upsert(
        snap.children.map((c) => ({
          id: c.id,
          user_id: user.id,
          // Child nickname is never sent: it stays on this device (COPPA / Kids rules).
          age: c.age,
          play_mode: c.playMode,
          created_at: new Date(c.createdAt).toISOString(),
          updated_at: new Date().toISOString(),
        })),
      );
    }
    const rows = snap.children.flatMap((c) =>
      Object.entries(snap.childData[c.id]?.progress ?? {}).map(([classId, p]) => ({
        user_id: user.id,
        child_id: c.id,
        class_id: classId,
        position_sec: p.positionSec,
        completed: p.completed,
        stars: p.stars,
        seg_index: p.segIndex ?? null,
        last_watched_at: new Date(p.lastWatchedAt).toISOString(),
        completed_at: p.completedAt ? new Date(p.completedAt).toISOString() : null,
      })),
    );
    if (rows.length) await db.from('progress').upsert(rows, { onConflict: 'child_id,class_id' });
    const days = snap.children.flatMap((c) => (snap.childData[c.id]?.activityDays ?? []).map((day) => ({ user_id: user.id, child_id: c.id, day })));
    if (days.length) await db.from('activity_days').upsert(days, { onConflict: 'child_id,day', ignoreDuplicates: true });
  }

  async pull(user: AuthUser): Promise<SyncSnapshot | null> {
    const db = sb();
    const [kids, prog, days] = await Promise.all([
      db.from('children').select('*').eq('user_id', user.id),
      db.from('progress').select('*').eq('user_id', user.id),
      db.from('activity_days').select('*').eq('user_id', user.id),
    ]);
    if (kids.error || prog.error) return null;
    const children: ChildProfile[] = (kids.data ?? []).map((r: any) => ({
      id: r.id,
      name: '', // nickname is device-only; the UI falls back to common.nameFallback
      age: r.age,
      playMode: r.play_mode === 'screen' ? 'screen' : 'real',
      createdAt: new Date(r.created_at).getTime(),
    }));
    const childData: Record<string, ChildData> = {};
    for (const c of children) childData[c.id] = { progress: {}, activityDays: [], stickers: [] };
    for (const r of (prog.data ?? []) as any[]) {
      const d = childData[r.child_id];
      if (!d) continue;
      const p: ClassProgress = {
        positionSec: Number(r.position_sec),
        completed: !!r.completed,
        stars: r.stars,
        lastWatchedAt: new Date(r.last_watched_at).getTime(),
      };
      if (r.completed_at) p.completedAt = new Date(r.completed_at).getTime();
      if (r.seg_index !== null && r.seg_index !== undefined) p.segIndex = r.seg_index;
      d.progress[r.class_id] = p;
    }
    for (const r of (days.data ?? []) as any[]) childData[r.child_id]?.activityDays.push(r.day);
    return { children, childData };
  }
}
