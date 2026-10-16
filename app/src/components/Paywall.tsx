import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { config } from '../config';
import { t, tList } from '../i18n';
import { PRICES, type Plan } from '../lib/entitlement';
import { payments, type PlanOffer } from '../services/payments';
import { useApp } from '../state/store';
import { colors, fonts, radius, shadow, space, type } from '../theme';
import { SongArt } from './art/SongArt';
import { Icon } from './Icon';
import { useGate } from './ParentalGate';
import { Button, T } from './ui';

/** "$59.99" / 12 -> "$5.00", keeping the store's currency formatting around the number. */
export function monthlyEquivalent(price: string): string {
  const m = /^([^\d]*)([\d.,]+)(.*)$/.exec(price.trim());
  if (!m) return price;
  const n = parseFloat(m[2].replace(/,/g, ''));
  return `${m[1]}${(n / 12).toFixed(2)}${m[3]}`;
}

/**
 * Store-compliant paywall (always opened behind the parental gate):
 * billed price is the largest pricing text; trial and per-month lines are smaller;
 * Restore, Terms, Privacy, auto-renew disclosure and a visible "keep playing free" option.
 */
export function Paywall({
  songTitle,
  moreClasses,
  onDone,
  onLater,
  childName,
}: {
  childName?: string;
  songTitle?: string;
  moreClasses?: number;
  onDone: () => void;
  onLater: () => void;
}) {
  const { purchase, restore, child } = useApp();
  const { openExternal } = useGate();
  const [offers, setOffers] = useState<PlanOffer[]>([]);
  const [plan, setPlan] = useState<Plan>('yearly');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    payments
      .getOffers()
      .then(setOffers)
      .catch(() => setMsg(t('errors.storeUnavailable', { storeName: storeName() })));
  }, []);

  const offer = offers.find((o) => o.plan === plan);
  const price = offer?.price ?? (plan === 'yearly' ? PRICES.yearly.label : PRICES.monthly.label);
  const period = t(`paywall.period.${plan === 'yearly' ? 'year' : 'month'}`);
  const planTitle = t(`paywall.plans.${plan === 'yearly' ? 'annual' : 'monthly'}.title`);
  const trialDays = PRICES.trialDays;
  const name = childName || child?.name || t('common.nameFallback');

  const buy = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await purchase(plan);
      if (r.ok) onDone();
      else if (r.cancelled) setMsg(t('paywall.canceledByUser'));
      else setMsg(`${t('errors.purchaseFailedTitle')}. ${t('errors.purchaseFailedBody')}`);
    } finally {
      setBusy(false);
    }
  };
  const doRestore = async () => {
    setBusy(true);
    try {
      const e = await restore();
      if (e.active) {
        setMsg(t('grownups.subscription.restoreDone'));
        onDone();
      } else setMsg(`${t('errors.restoreNothingTitle')}. ${t('errors.restoreNothingBody', { storeAccount: storeAccount() })}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap} testID="paywall">
      <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <SongArt icon="bird" size={84} />
        <SongArt icon="music" size={64} />
        <SongArt icon="bear" size={84} />
      </View>
      <T v="h1" accessibilityRole="header" style={styles.center}>
        {songTitle ? t('paywall.headlineFromSong', { songTitle }) : t('paywall.headline')}
      </T>
      <T v="body" style={styles.center}>
        {songTitle && moreClasses ? t('paywall.subheadFromSong', { songTitle, count: moreClasses }) : t('paywall.subhead')}
      </T>
      <View style={styles.features}>
        {tList('paywall.features', { name }).map((f) => (
          <View key={f} style={styles.feature}>
            <Icon name="check" size={24} color={colors.indigo} />
            <T v="body" style={{ flex: 1 }}>
              {f}
            </T>
          </View>
        ))}
      </View>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {(['yearly', 'monthly'] as Plan[]).map((p) => {
          const o = offers.find((x) => x.plan === p);
          const pr = o?.price ?? (p === 'yearly' ? PRICES.yearly.label : PRICES.monthly.label);
          const on = plan === p;
          const key = p === 'yearly' ? 'annual' : 'monthly';
          return (
            <Pressable
              key={p}
              testID={`plan-${p}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, selected: on }}
              accessibilityLabel={`${t(`paywall.plans.${key}.title`)}, ${t(`paywall.plans.${key}.price`, { annualPrice: pr, monthlyPrice: pr })}`}
              onPress={() => setPlan(p)}
              style={[styles.plan, on && styles.planOn]}
            >
              <View style={styles.planHead}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                <Text style={styles.planTitle}>{t(`paywall.plans.${key}.title`)}</Text>
                {p === 'yearly' ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('paywall.plans.annual.badge')}</Text>
                  </View>
                ) : null}
              </View>
              {/* Billed price: the largest pricing text on the screen. */}
              <Text style={styles.billed}>{t(`paywall.plans.${key}.price`, { annualPrice: pr, monthlyPrice: pr })}</Text>
              <Text style={type.small}>
                {p === 'yearly'
                  ? `${t('paywall.plans.annual.detail', { monthlyEquivalent: monthlyEquivalent(pr) })} ${t('paywall.save')}.`
                  : t('paywall.plans.monthly.detail')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <T v="small" style={styles.center}>
        {t('paywall.trialLine', { trialDays })}
      </T>
      {busy ? <ActivityIndicator color={colors.coral} /> : null}
      <Button testID="paywall-buy" label={t('paywall.ctaTrial', { trialDays })} onPress={buy} disabled={busy} />
      <T v="small" style={styles.center}>
        {t('paywall.underCtaTrial', { trialDays, price, period })}
      </T>
      {msg ? (
        <T v="bodyStrong" accessibilityLiveRegion="polite" style={[styles.center, { color: colors.indigo }]}>
          {msg}
        </T>
      ) : null}
      <Button testID="paywall-later" variant="secondary" size="md" label={t('paywall.keepFree')} onPress={onLater} />
      <View style={styles.links}>
        <Button testID="paywall-restore" variant="ghost" size="md" full={false} label={t('paywall.restore')} onPress={doRestore} />
        <Button variant="ghost" size="md" full={false} label={t('paywall.terms')} onPress={() => openExternal(config.links.terms)} />
        <Button variant="ghost" size="md" full={false} label={t('paywall.privacy')} onPress={() => openExternal(config.links.privacy)} />
      </View>
      <Text style={styles.disclosure}>
        {t(Platform.OS === 'android' ? 'paywall.disclosureAndroid' : 'paywall.disclosureIos', { planTitle, price, period, trialDays })}{' '}
        {t('paywall.disclosureNoTrialNote')}
      </Text>
    </View>
  );
}

export function storeName() {
  return Platform.OS === 'android' ? 'Google Play' : 'App Store';
}
export function storeAccount() {
  return Platform.OS === 'android' ? 'Google account' : 'Apple Account';
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 620, alignSelf: 'center', gap: space.lg, paddingVertical: space.lg },
  art: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: space.sm },
  center: { textAlign: 'center' },
  features: { gap: space.sm },
  feature: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  plans: { gap: space.md },
  plan: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 3, borderColor: colors.line, padding: space.lg, gap: 4, ...shadow.card },
  planOn: { borderColor: colors.coral },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.coral },
  radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral },
  planTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink, flexShrink: 1 },
  badge: { backgroundColor: colors.marigold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  billed: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.xs },
  disclosure: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24, color: colors.inkSoft },
});
