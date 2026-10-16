/* Minimal react-native -> react-dom shim for the OFFLINE web preview only (the sandbox
 * this was built in could not install react-native-web). Mirrors RN-web layout defaults.
 * Real builds use react-native / react-native-web. */
import React, { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

type AnyStyle = any;

export function flatten(style: AnyStyle): Record<string, any> {
  if (!style) return {};
  if (Array.isArray(style)) return style.reduce((acc, s) => Object.assign(acc, flatten(s)), {});
  return style;
}

const UNITLESS = new Set(['flexGrow', 'flexShrink', 'opacity', 'zIndex', 'fontWeight', 'aspectRatio']);
const FONT_MAP: Record<string, [string, number]> = {
  BricolageGrotesque_800ExtraBold: ['Bricolage Grotesque', 800],
  BricolageGrotesque_700Bold: ['Bricolage Grotesque', 700],
  DMSans_400Regular: ['DM Sans', 400],
  DMSans_500Medium: ['DM Sans', 500],
  DMSans_700Bold: ['DM Sans', 700],
};

export function toCss(style: AnyStyle, kind: 'view' | 'text' | 'image' = 'view'): React.CSSProperties {
  const s = flatten(style);
  const out: Record<string, any> = {};
  let shadow: any = null;
  for (const [k, v] of Object.entries(s)) {
    if (v === undefined || v === null) continue;
    switch (k) {
      case 'paddingHorizontal':
        out.paddingLeft = px(v);
        out.paddingRight = px(v);
        break;
      case 'paddingVertical':
        out.paddingTop = px(v);
        out.paddingBottom = px(v);
        break;
      case 'marginHorizontal':
        out.marginLeft = px(v);
        out.marginRight = px(v);
        break;
      case 'marginVertical':
        out.marginTop = px(v);
        out.marginBottom = px(v);
        break;
      case 'flex':
        if (typeof v === 'number') {
          if (v > 0) Object.assign(out, { flexGrow: v, flexShrink: 1, flexBasis: '0%' });
          else if (v === 0) Object.assign(out, { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' });
          else Object.assign(out, { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' });
        }
        break;
      case 'shadowColor':
      case 'shadowOpacity':
      case 'shadowRadius':
      case 'shadowOffset':
        shadow = shadow || {};
        shadow[k] = v;
        break;
      case 'elevation':
      case 'tintColor':
      case 'includeFontPadding':
      case 'textAlignVertical':
        break;
      case 'resizeMode':
        out.objectFit = v === 'stretch' ? 'fill' : v;
        break;
      case 'transform':
        if (Array.isArray(v)) {
          out.transform = v
            .map((t: any) => {
              const [name, val] = Object.entries(t)[0] as [string, any];
              if (name.startsWith('translate')) return `${name}(${px(val)})`;
              if (name.startsWith('rotate') || name.startsWith('skew')) return `${name}(${val})`;
              return `${name}(${val})`;
            })
            .join(' ');
        } else out.transform = v;
        break;
      case 'fontFamily': {
        const f = FONT_MAP[v];
        if (f) {
          out.fontFamily = `'${f[0]}', system-ui, sans-serif`;
          out.fontWeight = f[1];
        } else out.fontFamily = v;
        break;
      }
      case 'textDecorationLine':
        out.textDecoration = v;
        break;
      default:
        out[k] = typeof v === 'number' && !UNITLESS.has(k) ? px(v) : v;
    }
  }
  if (shadow && kind !== 'text') {
    const o = shadow.shadowOffset ?? { width: 0, height: 0 };
    const c = hexA(shadow.shadowColor ?? '#000', shadow.shadowOpacity ?? 0.3);
    out.boxShadow = `${o.width}px ${o.height}px ${shadow.shadowRadius ?? 0}px ${c}`;
  }
  return out;
}
const px = (v: any) => (typeof v === 'number' ? `${v}px` : v);
function hexA(c: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(c);
  if (!m) return c;
  const n = parseInt(m[1], 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

const ROLE: Record<string, string> = {
  button: 'button',
  header: 'heading',
  tab: 'tab',
  tablist: 'tablist',
  radio: 'radio',
  radiogroup: 'radiogroup',
  progressbar: 'progressbar',
  adjustable: 'slider',
  link: 'link',
  image: 'img',
};

function a11y(p: any) {
  const o: any = {};
  if (p.testID) o['data-testid'] = p.testID;
  if (p.nativeID) o.id = p.nativeID;
  if (p.accessibilityLabel) o['aria-label'] = p.accessibilityLabel;
  if (p.accessibilityRole && ROLE[p.accessibilityRole]) o.role = ROLE[p.accessibilityRole];
  if (p.accessibilityRole === 'header') o['aria-level'] = 2;
  const st = p.accessibilityState;
  if (st) {
    if (st.selected !== undefined) o['aria-selected'] = st.selected;
    if (st.checked !== undefined) o['aria-checked'] = st.checked;
    if (st.disabled) o['aria-disabled'] = true;
  }
  if (p.accessibilityValue?.now !== undefined) {
    o['aria-valuenow'] = p.accessibilityValue.now;
    o['aria-valuemin'] = p.accessibilityValue.min;
    o['aria-valuemax'] = p.accessibilityValue.max;
  }
  if (p.accessibilityElementsHidden || p.importantForAccessibility === 'no-hide-descendants') o['aria-hidden'] = true;
  if (p.accessibilityLiveRegion) o['aria-live'] = p.accessibilityLiveRegion;
  return o;
}

function useLayoutCb(ref: React.RefObject<HTMLElement | null>, onLayout?: (e: any) => void) {
  useLayoutEffect(() => {
    if (!onLayout || !ref.current) return;
    const el = ref.current;
    const fire = () => {
      const r = el.getBoundingClientRect();
      onLayout({ nativeEvent: { layout: { x: el.offsetLeft, y: el.offsetTop, width: r.width, height: r.height } } });
    };
    fire();
    const ro = new ResizeObserver(fire);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function attachHost(el: any) {
  if (el && !el.measureInWindow) {
    el.measureInWindow = (cb: any) => {
      const r = el.getBoundingClientRect();
      cb(r.left, r.top, r.width, r.height);
    };
  }
}

function setRef(ref: any, el: any) {
  if (typeof ref === 'function') ref(el);
  else if (ref) ref.current = el;
}

function responderHandlers(p: any) {
  if (!p.onStartShouldSetResponder) return {};
  const ev = (e: any) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { nativeEvent: { locationX: e.clientX - r.left, locationY: e.clientY - r.top, pageX: e.clientX, pageY: e.clientY } };
  };
  return {
    onPointerDown: (e: any) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.currentTarget.__down = true;
      p.onResponderGrant?.(ev(e));
    },
    onPointerMove: (e: any) => {
      if (e.currentTarget.__down) p.onResponderMove?.(ev(e));
    },
    onPointerUp: (e: any) => {
      e.currentTarget.__down = false;
      p.onResponderRelease?.(ev(e));
    },
  };
}

export const View = forwardRef<any, any>(function View(p, ref) {
  const inner = useRef<HTMLDivElement | null>(null);
  useLayoutCb(inner, p.onLayout);
  const style = toCss(p.style);
  if (p.pointerEvents === 'none' || p.pointerEvents === 'box-none') style.pointerEvents = p.pointerEvents === 'none' ? 'none' : undefined;
  return (
    <div
      ref={(el) => {
        inner.current = el;
        attachHost(el);
        setRef(ref, el);
      }}
      className="rn-view"
      style={style}
      {...a11y(p)}
      {...responderHandlers(p)}
    >
      {p.children}
    </div>
  );
});

const TextNest = createContext(false);
export const Text = forwardRef<any, any>(function Text(p, ref) {
  const nested = useContext(TextNest);
  const style: any = toCss(p.style, 'text');
  if (p.numberOfLines) {
    Object.assign(style, { display: '-webkit-box', WebkitLineClamp: p.numberOfLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' });
  }
  const Tag: any = nested ? 'span' : 'div';
  return (
    <TextNest.Provider value>
      <Tag ref={ref} className={nested ? 'rn-text-nested' : 'rn-text'} style={style} onClick={p.onPress} {...a11y(p)}>
        {p.children}
      </Tag>
    </TextNest.Provider>
  );
});

export const Pressable = forwardRef<any, any>(function Pressable(p, ref) {
  const [pressed, setPressed] = useState(false);
  const style = typeof p.style === 'function' ? p.style({ pressed }) : p.style;
  const children = typeof p.children === 'function' ? p.children({ pressed }) : p.children;
  const disabled = !!p.disabled;
  const end = () => {
    if (pressed) {
      setPressed(false);
      p.onPressOut?.();
    }
  };
  return (
    <div
      ref={(el) => {
        attachHost(el);
        setRef(ref, el);
      }}
      className="rn-view rn-pressable"
      role="button"
      tabIndex={disabled ? -1 : 0}
      style={{ ...toCss(style), cursor: disabled ? 'default' : 'pointer' }}
      {...a11y(p)}
      aria-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (disabled) return;
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
        setPressed(true);
        p.onPressIn?.(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onClick={() => !disabled && p.onPress?.()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) p.onPress?.();
      }}
    >
      {children}
    </div>
  );
});
export const TouchableOpacity = Pressable;

export const ScrollView = forwardRef<any, any>(function ScrollView(p, ref) {
  const h = !!p.horizontal;
  const base: any = h
    ? { flexDirection: 'row', overflowX: 'auto', overflowY: 'hidden', flexGrow: 0, flexShrink: 0 }
    : { flexGrow: 1, flexShrink: 1, flexBasis: '0%', overflowY: 'auto', overflowX: 'hidden' };
  return (
    <div ref={ref} className={`rn-view ${p.showsHorizontalScrollIndicator === false ? 'rn-noscrollbar' : ''}`} style={{ ...base, ...toCss(p.style) }} {...a11y(p)}>
      <div className="rn-view" style={{ ...(h ? { flexDirection: 'row' } : {}), ...toCss(p.contentContainerStyle) }}>
        {p.children}
      </div>
    </div>
  );
});

export const TextInput = forwardRef<any, any>(function TextInput(p, ref) {
  const numeric = p.keyboardType === 'number-pad' || p.keyboardType === 'numeric' || p.inputMode === 'numeric';
  return (
    <input
      ref={ref}
      className="rn-input"
      style={toCss(p.style, 'text')}
      value={p.value}
      placeholder={p.placeholder}
      onChange={(e) => p.onChangeText?.(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') p.onSubmitEditing?.();
      }}
      inputMode={numeric ? 'numeric' : p.keyboardType === 'email-address' ? 'email' : undefined}
      type={p.keyboardType === 'email-address' ? 'email' : 'text'}
      autoFocus={p.autoFocus}
      disabled={p.editable === false}
      maxLength={p.maxLength}
      autoComplete={p.autoComplete}
      {...a11y(p)}
    />
  );
});

export function Image(p: any) {
  const src = typeof p.source === 'string' ? p.source : p.source?.uri;
  return <img src={src} alt="" style={{ display: 'block', ...toCss(p.style, 'image'), objectFit: p.resizeMode === 'stretch' ? 'fill' : p.resizeMode ?? 'cover' }} onError={p.onError} aria-hidden />;
}

export function Modal(p: any) {
  if (!p.visible) return null;
  return (
    <div className="rn-view" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: p.transparent ? 'transparent' : '#fff', overflow: 'auto' }}>
      {p.children}
    </div>
  );
}

export function ActivityIndicator(p: any) {
  return <div className="rn-spinner" style={{ borderColor: p.color ?? '#999', borderRightColor: 'transparent' }} aria-label="Loading" />;
}

const absoluteFill = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 };
export const StyleSheet = {
  create: <T,>(s: T) => s,
  flatten,
  absoluteFill,
  absoluteFillObject: absoluteFill,
  hairlineWidth: 1,
};

export const Platform = {
  OS: 'web',
  select: (o: any) => (o.web !== undefined ? o.web : o.default),
};

export function useWindowDimensions() {
  const [d, setD] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const on = () => setD({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return { ...d, scale: 1, fontScale: 1 };
}
export const Dimensions = { get: () => ({ width: window.innerWidth, height: window.innerHeight, scale: 1, fontScale: 1 }) };

export const AppState = {
  currentState: 'active',
  addEventListener(_t: string, fn: (s: string) => void) {
    const on = () => fn(document.visibilityState === 'visible' ? 'active' : 'background');
    document.addEventListener('visibilitychange', on);
    return { remove: () => document.removeEventListener('visibilitychange', on) };
  },
};

export const AccessibilityInfo = {
  isReduceMotionEnabled: async () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
};

export const Linking = {
  openURL: async (url: string) => {
    (window as any).__openedUrls = [...((window as any).__openedUrls ?? []), url];
    window.open(url, '_blank');
  },
};

export type GestureResponderEvent = any;
export type LayoutChangeEvent = any;
export type PressableProps = any;
export type StyleProp<T> = any;
export type TextProps = any;
export type TextStyle = any;
export type ViewStyle = any;
