import type { ChildData, ChildProfile } from '../../types';

export interface AuthUser {
  id: string;
  email?: string;
}

/** What sync sends: never the child's nickname (it stays on the device). */
export interface SyncSnapshot {
  children: ChildProfile[];
  childData: Record<string, ChildData>;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

/** Accounts are optional: guest mode is the default and everything works without them. */
export interface AuthService {
  readonly enabled: boolean;
  /** True for the preview's demo accounts (nothing is sent anywhere). */
  readonly demo?: boolean;
  getUser(): Promise<AuthUser | null>;
  /** Emails a 6-digit sign-in code (creates the account on first use). */
  sendCode(email: string): Promise<AuthResult>;
  verifyCode(email: string, code: string): Promise<AuthResult>;
  appleAvailable(): Promise<boolean>;
  signInWithApple(): Promise<AuthResult>;
  googleAvailable(): Promise<boolean>;
  /** Google sign-in in the system browser (behind the parental gate: it leaves the app). */
  signInWithGoogle(): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** Deletes the account and synced data on the server (Apple 5.1.1(v)). */
  deleteAccount(): Promise<AuthResult>;
  onChange(cb: (user: AuthUser | null) => void): () => void;
}

export interface SyncService {
  push(user: AuthUser, snap: SyncSnapshot): Promise<void>;
  pull(user: AuthUser): Promise<SyncSnapshot | null>;
}
