import { useRouter } from 'expo-router';
import { useGate } from './components/ParentalGate';
import { classById } from './data/catalog';
import { canPlayClass } from './lib/entitlement';
import { t } from './i18n';
import { useApp } from './state/store';

/** Opens a class in the child's mode; locked classes go lock -> parental gate -> paywall. */
export function useOpenClass() {
  const router = useRouter();
  const { entitlement, child } = useApp();
  const { requireGate } = useGate();
  return (classId: string, mode?: 'real' | 'screen', opts: { replace?: boolean } = {}) => {
    const hit = classById(classId);
    if (!hit) return;
    if (!canPlayClass(hit.cls, entitlement)) {
      requireGate('paywall', () => router.push(`/paywall?classId=${encodeURIComponent(classId)}` as never));
      return;
    }
    const href = `/play/${encodeURIComponent(classId)}?mode=${mode ?? child?.playMode ?? 'real'}`;
    if (opts.replace) router.replace(href as never);
    else router.push(href as never);
  };
}

export function useChildName(): string {
  const { child } = useApp();
  return child?.name?.trim() || t('common.nameFallback');
}
