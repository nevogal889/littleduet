// Tiny expo-router stand-in for the offline web preview: explicit route table, history
// stack synced to the browser URL, Stack renders the top route, Tabs renders tab + tabBar.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface RouteDef {
  pattern: string; // '/song/:id'
  Component: React.ComponentType<any>;
  tab?: boolean;
}

interface RouterState {
  stack: string[];
  routes: RouteDef[];
  TabsLayout: React.ComponentType<any>;
  setStack: (fn: (s: string[]) => string[]) => void;
}
const Ctx = createContext<RouterState | null>(null);
const RouteCtx = createContext<{ path: string; params: Record<string, string> } | null>(null);

function match(routes: RouteDef[], href: string) {
  const [pathRaw, qs] = href.split('?');
  const path = pathRaw === '/index' ? '/' : pathRaw || '/';
  for (const r of routes) {
    const a = r.pattern.split('/').filter(Boolean);
    const b = path.split('/').filter(Boolean);
    if (a.length !== b.length) continue;
    const params: Record<string, string> = {};
    if (a.every((seg, i) => (seg.startsWith(':') ? ((params[seg.slice(1)] = decodeURIComponent(b[i])), true) : seg === b[i]))) {
      new URLSearchParams(qs ?? '').forEach((v, k) => (params[k] = v));
      return { route: r, params, path };
    }
  }
  return null;
}

export function RouterRoot({ routes, TabsLayout, children }: { routes: RouteDef[]; TabsLayout: React.ComponentType<any>; children: React.ReactNode }) {
  // Hosted previews (window.__LD_MEMORY_ROUTER) keep routes in memory and never touch the URL.
  const mem = !!(window as any).__LD_MEMORY_ROUTER;
  const here = () => (mem ? '/' : location.pathname + location.search);
  const [stack, setStackRaw] = useState<string[]>([here()]);
  const setStack = (fn: (s: string[]) => string[]) =>
    setStackRaw((s) => {
      const n = fn(s);
      const top = n[n.length - 1];
      if (!mem && location.pathname + location.search !== top) history.replaceState(null, '', top);
      return n;
    });
  useEffect(() => {
    if (mem) return;
    const on = () => setStackRaw((s) => (s.length > 1 ? s.slice(0, -1) : [here()]));
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  (window as any).__routerStack = stack;
  return <Ctx.Provider value={{ stack, routes, TabsLayout, setStack }}>{children}</Ctx.Provider>;
}

function useR() {
  const r = useContext(Ctx);
  if (!r) throw new Error('router');
  return r;
}

export function useRouter() {
  const r = useR();
  return useMemo(
    () => ({
      push: (href: string) => r.setStack((s) => [...s, href]),
      replace: (href: string) => r.setStack((s) => [...s.slice(0, -1), href]),
      back: () => r.setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      canGoBack: () => r.stack.length > 1,
      navigate: (href: string) =>
        r.setStack((s) => {
          const cur = match(r.routes, s[s.length - 1]);
          const nxt = match(r.routes, href);
          if (cur?.route.tab && nxt?.route.tab) return [...s.slice(0, -1), href];
          const i = s.lastIndexOf(href);
          return i >= 0 ? s.slice(0, i + 1) : [...s, href];
        }),
      dismissAll: () => r.setStack((s) => s.slice(0, 1)),
      dismissTo: (href: string) =>
        r.setStack((s) => {
          const i = s.lastIndexOf(href);
          return i >= 0 ? s.slice(0, i + 1) : [...s.slice(0, -1), href];
        }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r.stack],
  );
}

export function usePathname() {
  const rc = useContext(RouteCtx);
  const r = useR();
  return rc?.path ?? (match(r.routes, r.stack[r.stack.length - 1])?.path || '/');
}

export function useLocalSearchParams<T = Record<string, string>>(): T {
  return (useContext(RouteCtx)?.params ?? {}) as T;
}

export function useFocusEffect(cb: () => void | (() => void)) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => ref.current() || undefined, []);
}

export function Redirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => router.replace(href), []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Top() {
  const r = useR();
  const top = r.stack[r.stack.length - 1];
  const m = match(r.routes, top);
  if (!m) return <div style={{ padding: 20 }}>Not found: {top}</div>;
  const C = m.route.Component;
  const T = r.TabsLayout;
  return (
    <RouteCtx.Provider value={{ path: m.path, params: m.params }}>
      <div className="rn-view" style={{ flex: '1 1 0%', minHeight: 0 }} key={m.route.tab ? 'tabs' : top}>
        {m.route.tab ? <T /> : <C />}
      </div>
    </RouteCtx.Provider>
  );
}

function StackImpl(_p: any) {
  return <Top />;
}
StackImpl.Screen = (_p: any) => null;
export const Stack = StackImpl;

function TabsImpl(p: any) {
  const r = useR();
  const m = match(r.routes, r.stack[r.stack.length - 1])!;
  const C = m.route.Component;
  return (
    <div className="rn-view" style={{ flex: '1 1 0%', minHeight: 0 }}>
      <div className="rn-view" style={{ flex: '1 1 0%', minHeight: 0 }} key={m.path}>
        <C />
      </div>
      {p.tabBar?.({})}
    </div>
  );
}
TabsImpl.Screen = (_p: any) => null;
export const Tabs = TabsImpl;
