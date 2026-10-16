// Small stand-ins for Expo modules used by the app (offline web preview only).
import React, { useEffect, useRef, useState } from 'react';

// expo: useEvent / useEventListener
export function useEvent(obj: any, name: string, initial: any) {
  const [v, setV] = useState(initial);
  useEffect(() => obj.addListener(name, setV).remove, [obj, name]);
  return v;
}
export function useEventListener(obj: any, name: string, fn: (p: any) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => obj.addListener(name, (p: any) => ref.current(p)).remove, [obj, name]);
}

// safe-area
export function SafeAreaProvider({ children }: any) {
  return <>{children}</>;
}
export { View as SafeAreaView } from './react-native';
export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });

// fonts
export const useFonts = () => [true, null];
export const BricolageGrotesque_700Bold = 'BricolageGrotesque_700Bold';
export const BricolageGrotesque_800ExtraBold = 'BricolageGrotesque_800ExtraBold';
export const DMSans_400Regular = 'DMSans_400Regular';
export const DMSans_500Medium = 'DMSans_500Medium';
export const DMSans_700Bold = 'DMSans_700Bold';

// splash / orientation / status bar / keep awake / haptics
export const preventAutoHideAsync = async () => {};
export const hideAsync = async () => {};
export const lockAsync = async () => {};
export const OrientationLock = { PORTRAIT_UP: 1 };
export const StatusBar = () => null;
export const useKeepAwake = () => {};

// constants / asset
const Constants = { expoConfig: { version: '1.0.0', name: 'Little Duet' } };
export default Constants;
export const Asset = { fromModule: (m: any) => ({ uri: typeof m === 'string' ? m : m?.uri ?? String(m) }) };

// async-storage (default export object)
export const AsyncStorageImpl = {
  getItem: async (k: string) => localStorage.getItem(k),
  setItem: async (k: string, v: string) => localStorage.setItem(k, v),
  removeItem: async (k: string) => localStorage.removeItem(k),
  clear: async () => localStorage.clear(),
};
