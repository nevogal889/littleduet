import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { LESSONS, SONGS } from '../data/catalog';
import { FREE_ENTITLEMENT, isEntitled, type Entitlement, type Plan } from '../lib/entitlement';
import { mergeProgress, recordCompletion, recordPosition } from '../lib/progress';
import { localDay, newlyEarned, type Sticker } from '../lib/stickers';
import { auth, sync, type AuthUser } from '../services/auth';
import { payments, type PurchaseResult } from '../services/payments';
import { loadJson, saveJson } from '../services/storage';
import type { ChildData, ChildProfile, LessonClass, PlayMode } from '../types';

const KEY = 'littleduet:state:v1';

export interface AppData {
  version: 1;
  onboarded: boolean;
  children: ChildProfile[];
  activeChildId: string | null;
  childData: Record<string, ChildData>;
}

const EMPTY: AppData = { version: 1, onboarded: false, children: [], activeChildId: null, childData: {} };
const emptyChild = (): ChildData => ({ progress: {}, activityDays: [], stickers: [] });
const newId = () => `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

interface Ctx {
  ready: boolean;
  data: AppData;
  child: ChildProfile | null;
  childData: ChildData;
  entitlement: Entitlement;
  entitled: boolean;
  user: AuthUser | null;
  addChild(name: string, age: number, playMode?: PlayMode): string;
  updateChild(id: string, patch: Partial<Omit<ChildProfile, 'id'>>): void;
  removeChild(id: string): void;
  setActiveChild(id: string): void;
  finishOnboarding(): void;
  setPlayMode(mode: PlayMode): void;
  savePosition(cls: LessonClass, positionSec: number, segIndex?: number): void;
  /** Returns stickers newly earned by this completion. */
  completeClass(cls: LessonClass, stars: number, mode: PlayMode): Sticker[];
  resetProgress(childId: string): void;
  purchase(plan: Plan): Promise<PurchaseResult>;
  restore(): Promise<Entitlement>;
  manageSubscription(): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<boolean>;
  /** Erase everything on this device (profiles, progress). Plan is not affected. */
  eraseDevice(): void;
  flush(): Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(EMPTY);
  const [entitlement, setEntitlement] = useState<Entitlement>(FREE_ENTITLEMENT);
  const [user, setUser] = useState<AuthUser | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Hydrate
  useEffect(() => {
    (async () => {
      const saved = await loadJson<AppData>(KEY);
      if (saved?.version === 1) setData(saved);
      try {
        await payments.init();
        setEntitlement(await payments.getEntitlement());
      } catch {}
      try {
        setUser(await auth.getUser());
      } catch {}
      setReady(true);
    })();
    return auth.onChange(setUser);
  }, []);

  // Persist (debounced) + flush when the app goes to the background.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = useCallback(async () => {
    // let pending state updates land in dataRef first
    await new Promise((r) => setTimeout(r, 30));
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    await saveJson(KEY, dataRef.current);
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveJson(KEY, dataRef.current), 400);
  }, [data, ready]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') flush();
    });
    return () => sub.remove();
  }, [flush]);

  // Account sync: pull + merge on sign-in, push (debounced) on change.
  useEffect(() => {
    if (!user || !sync) return;
    (async () => {
      const remote = await sync!.pull(user).catch(() => null);
      if (!remote) return;
      setData((d) => {
        const kids = [...d.children];
        for (const rc of remote.children) if (!kids.some((k) => k.id === rc.id)) kids.push(rc);
        const cd = { ...d.childData };
        for (const [id, rd] of Object.entries(remote.childData)) {
          const ld = cd[id] ?? emptyChild();
          cd[id] = {
            progress: mergeProgress(ld.progress, rd.progress),
            activityDays: [...new Set([...ld.activityDays, ...rd.activityDays])],
            stickers: [...new Set([...ld.stickers, ...rd.stickers])],
          };
        }
        return { ...d, children: kids, childData: cd, activeChildId: d.activeChildId ?? kids[0]?.id ?? null, onboarded: d.onboarded || kids.length > 0 };
      });
    })();
  }, [user]);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !sync || !ready) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      sync!.push(user, { children: dataRef.current.children, childData: dataRef.current.childData }).catch(() => {});
    }, 3000);
  }, [data, user, ready]);

  const child = data.children.find((c) => c.id === data.activeChildId) ?? data.children[0] ?? null;
  const childData = (child && data.childData[child.id]) || emptyChild();

  const updateChildData = useCallback((fn: (cd: ChildData) => ChildData) => {
    setData((d) => {
      const id = d.activeChildId ?? d.children[0]?.id;
      if (!id) return d;
      return { ...d, childData: { ...d.childData, [id]: fn(d.childData[id] ?? emptyChild()) } };
    });
  }, []);

  const withToday = (days: string[]) => {
    const today = localDay(Date.now());
    return days.includes(today) ? days : [...days, today].slice(-400);
  };

  const value: Ctx = useMemo(
    () => ({
      ready,
      data,
      child,
      childData,
      entitlement,
      entitled: isEntitled(entitlement),
      user,
      addChild(name, age, playMode = 'real') {
        const id = newId();
        setData((d) => ({
          ...d,
          children: [...d.children, { id, name: name.trim(), age, playMode, createdAt: Date.now() }],
          childData: { ...d.childData, [id]: emptyChild() },
          activeChildId: id,
        }));
        return id;
      },
      updateChild(id, patch) {
        setData((d) => ({ ...d, children: d.children.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
      },
      removeChild(id) {
        setData((d) => {
          const children = d.children.filter((c) => c.id !== id);
          const childData = { ...d.childData };
          delete childData[id];
          return { ...d, children, childData, activeChildId: d.activeChildId === id ? children[0]?.id ?? null : d.activeChildId };
        });
      },
      setActiveChild(id) {
        setData((d) => ({ ...d, activeChildId: id }));
      },
      finishOnboarding() {
        setData((d) => ({ ...d, onboarded: true }));
      },
      setPlayMode(mode) {
        setData((d) => {
          const id = d.activeChildId ?? d.children[0]?.id;
          return { ...d, children: d.children.map((c) => (c.id === id ? { ...c, playMode: mode } : c)) };
        });
      },
      savePosition(cls, positionSec, segIndex) {
        updateChildData((cd) => ({
          ...cd,
          progress: recordPosition(cd.progress, cls, positionSec, Date.now(), segIndex !== undefined ? { segIndex } : {}),
          activityDays: withToday(cd.activityDays),
        }));
      },
      completeClass(cls, stars, mode) {
        const id = dataRef.current.activeChildId ?? dataRef.current.children[0]?.id;
        const before = (id && dataRef.current.childData[id]?.progress) || {};
        const after = recordCompletion(before, cls, stars, Date.now());
        const earned = newlyEarned(SONGS, LESSONS, before, after);
        updateChildData((cd) => ({
          ...cd,
          progress: recordCompletion(cd.progress, cls, stars, Date.now()),
          activityDays: withToday(cd.activityDays),
          stickers: [...new Set([...cd.stickers, ...earned.map((s) => s.id)])],
          modesUsed: [...new Set([...(cd.modesUsed ?? []), mode])],
        }));
        return earned;
      },
      resetProgress(childId) {
        setData((d) => ({ ...d, childData: { ...d.childData, [childId]: emptyChild() } }));
      },
      async purchase(plan) {
        const r = await payments.purchase(plan);
        setEntitlement(r.entitlement);
        return r;
      },
      async restore() {
        const e = await payments.restore();
        setEntitlement(e);
        return e;
      },
      async manageSubscription() {
        await payments.manage();
        setEntitlement(await payments.getEntitlement());
      },
      async signOut() {
        await auth.signOut();
        setUser(null);
      },
      async deleteAccount() {
        const r = await auth.deleteAccount();
        if (r.ok) setUser(null);
        return r.ok;
      },
      eraseDevice() {
        setData(EMPTY);
      },
      flush,
    }),
    [ready, data, child, childData, entitlement, user, flush, updateChildData],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}
