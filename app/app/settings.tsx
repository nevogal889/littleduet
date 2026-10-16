import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { ConfirmSheet } from '../src/components/ConfirmSheet';
import { ParentalGate, useGate } from '../src/components/ParentalGate';
import { storeName } from '../src/components/Paywall';
import { Pill } from '../src/components/bits';
import { BackButton, Button, Card, Field, Screen, SectionTitle, Segmented, T } from '../src/components/ui';
import { BirthdayPicker } from '../src/components/BirthdayPicker';
import { ageOn, childAge, parseDay } from '../src/lib/birthday';
import { authEnabled, config } from '../src/config';
import { t, tRaw } from '../src/i18n';
import { isEntitled } from '../src/lib/entitlement';
import { useApp } from '../src/state/store';
import { colors, fonts, radius, space, touch } from '../src/theme';

type Confirm = null | 'reset' | 'erase' | 'signOut' | 'delete' | { remove: string };

export default function Settings() {
  const router = useRouter();
  const gate = useGate();
  const app = useApp();
  const { child, data, entitlement, user } = app;
  const [open, setOpen] = useState(gate.isUnlocked());
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | null>(null);
  const [newBirthday, setNewBirthday] = useState<string | undefined>(undefined);
  const [newAgeOnly, setNewAgeOnly] = useState(false);
  const [editBday, setEditBday] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setOpen(gate.isUnlocked());
    }, [gate]),
  );

  if (!open) {
    return (
      <Screen testID="settings-gate">
        <View style={{ paddingTop: space.lg }}>
          <ParentalGate
            purpose="settings"
            onPass={() => {
              gate.unlock();
              setOpen(true);
            }}
            onCancel={() => (router.canGoBack() ? router.back() : router.replace('/' as never))}
          />
        </View>
      </Screen>
    );
  }

  const nameOf = (n: string) => n.trim() || t('common.nameFallback');
  const activeName = nameOf(child?.name ?? '');
  const ent = entitlement;
  const subTitle = !isEntitled(ent)
    ? t('grownups.subscription.statusFree')
    : ent.trial
      ? t('grownups.subscription.statusTrial')
      : ent.plan === 'yearly'
        ? t('grownups.subscription.statusActiveAnnual')
        : t('grownups.subscription.statusActiveMonthly');
  const subBody = !isEntitled(ent)
    ? t('grownups.subscription.statusFreeBody')
    : ent.expiresAt
      ? t('grownups.subscription.statusActiveBody', { renewDate: new Date(ent.expiresAt).toLocaleDateString() })
      : t('grownups.subscription.familyNote');
  const faq = (tRaw('grownups.help.faq') as { q: string; a: string }[] | undefined) ?? [];

  const runConfirm = async () => {
    const c = confirm;
    setConfirm(null);
    if (c === 'reset' && child) app.resetProgress(child.id);
    else if (c === 'erase') {
      app.eraseDevice();
      router.replace('/onboarding' as never);
    } else if (c === 'signOut') await app.signOut();
    else if (c === 'delete') setMsg((await app.deleteAccount()) ? t('grownups.account.deleteDone') : t('errors.deleteFailed'));
    else if (c && typeof c === 'object') app.removeChild(c.remove);
  };

  const confirmText = (() => {
    if (confirm === 'reset') return { title: t('grownups.reset.title', { name: activeName }), body: t('grownups.reset.body', { name: activeName }), ok: t('grownups.reset.confirm') };
    if (confirm === 'erase') return { title: t('grownups.privacy.eraseTitle'), body: t('grownups.privacy.eraseBody'), ok: t('grownups.privacy.eraseConfirm') };
    if (confirm === 'signOut') return { title: t('grownups.account.signOutTitle'), body: t('grownups.account.signOutBody'), ok: t('grownups.account.signOut') };
    if (confirm === 'delete') return { title: t('grownups.account.deleteTitle'), body: t('grownups.account.deleteBody', { storeName: storeName() }), ok: t('grownups.account.deleteConfirm') };
    if (confirm && typeof confirm === 'object') {
      const n = nameOf(data.children.find((c) => c.id === confirm.remove)?.name ?? '');
      return { title: t('grownups.children.removeTitle', { name: n }), body: t('grownups.children.removeBody', { name: n }), ok: t('grownups.children.removeConfirm') };
    }
    return { title: '', body: '', ok: '' };
  })();

  return (
    <Screen testID="settings">
      <View style={{ paddingTop: space.sm }}>
        <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))} label={t('common.back')} />
      </View>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <T v="h1" accessibilityRole="header">
            {t('settings.title')}
          </T>
          <T v="small">{t('settings.subtitle')}</T>
        </View>
      </View>
      {msg ? (
        <T v="bodyStrong" accessibilityLiveRegion="polite" style={{ marginTop: space.md }}>
          {msg}
        </T>
      ) : null}

      <SectionTitle>{t('grownups.sections.children')}</SectionTitle>
      <View style={{ gap: space.md }}>
        {data.children.map((c) => {
          const active = c.id === child?.id;
          return (
            <Card key={c.id} style={{ gap: space.md }}>
              <View style={styles.childRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{nameOf(c.name).slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="bodyStrong">{nameOf(c.name)}</T>
              </View>
              {active ? (
                <Pill tone="dark" label={t('grownups.children.active')} />
              ) : (
                <View style={{ gap: space.xs }}>
                  <Button size="md" full={false} variant="secondary" label={t('grownups.children.switch', { name: nameOf(c.name) })} onPress={() => app.setActiveChild(c.id)} />
                  <Button size="md" full={false} variant="ghost" label={t('common.remove')} onPress={() => setConfirm({ remove: c.id })} />
                </View>
              )}
              </View>
              <View style={styles.bdayRow}>
              <T v="small" testID={`child-age-${c.id}`}>
                {c.birthday
                  ? t('birthday.summary', { date: fmtDay(c.birthday), age: ageOn(c.birthday, Date.now()) ?? c.age })
                  : t('grownups.children.ageButton', { age: c.age })}
              </T>
              <Pressable testID={`edit-bday-${c.id}`} accessibilityRole="button" onPress={() => setEditBday(editBday === c.id ? null : c.id)} hitSlop={8}>
                <Text style={styles.link}>{c.birthday ? t('settings.editBirthday') : t('settings.addBirthday')}</Text>
              </Pressable>
              </View>
              {editBday === c.id ? (
                <View style={{ gap: space.md }}>
                  <BirthdayPicker
                    testID={`bday-${c.id}`}
                    value={c.birthday}
                    onChange={(v) => v && app.updateChild(c.id, { birthday: v, age: childAge({ age: c.age, birthday: v }, Date.now()), ageSeen: childAge({ age: c.age, birthday: v }, Date.now()) })}
                  />
                  <T v="small">{t('birthday.helper')}</T>
                  <Button testID={`bday-done-${c.id}`} variant="secondary" size="md" label={t('settings.done')} onPress={() => setEditBday(null)} />
                </View>
              ) : null}
            </Card>
          );
        })}
        {adding ? (
          <Card style={styles.card}>
            <T v="bodyStrong">{t('grownups.children.nameLabel')}</T>
            <Field
              testID="add-child-name"
              value={newName}
              onChangeText={(v) => setNewName(v.slice(0, 24))}
              placeholder={t('onboarding.child.namePlaceholder')}
              accessibilityLabel={t('grownups.children.nameLabel')}
              style={styles.input}
            />
            <T v="small">{t('grownups.children.nicknameNote')}</T>
            {newAgeOnly ? (
              <>
            <T v="bodyStrong">{t('onboarding.child.ageTitleNoName')}</T>
            <View style={styles.ages}>
              {[2, 3, 4, 5, 6].map((a) => (
                <Pressable
                  key={a}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newAge === a }}
                  accessibilityLabel={t('grownups.children.ageButton', { age: a })}
                  onPress={() => setNewAge(a)}
                  style={[styles.age, newAge === a && styles.ageOn]}
                >
                  <Text style={styles.ageText}>{a}</Text>
                </Pressable>
              ))}
            </View>
              </>
            ) : (
              <>
                <T v="bodyStrong">{t('birthday.titleNoName')}</T>
                <BirthdayPicker testID="add-bday" value={newBirthday} onChange={setNewBirthday} />
              </>
            )}
            <Pressable accessibilityRole="button" onPress={() => setNewAgeOnly((v) => !v)} hitSlop={8}>
              <Text style={styles.link}>{newAgeOnly ? t('birthday.useBirthday') : t('birthday.justAge')}</Text>
            </Pressable>
            <Button
              testID="add-child-save"
              label={t('common.save')}
              disabled={newAgeOnly ? newAge === null : !newBirthday}
              onPress={() => {
                const bd = newAgeOnly ? undefined : newBirthday;
                app.addChild(newName, bd ? childAge({ age: 3, birthday: bd }, Date.now()) : newAge ?? 3, child?.playMode ?? 'real', bd);
                setNewBirthday(undefined);
                setAdding(false);
                setNewName('');
                setNewAge(null);
              }}
            />
            <Button variant="ghost" size="md" label={t('common.cancel')} onPress={() => setAdding(false)} />
          </Card>
        ) : (
          <Button testID="add-child" variant="secondary" icon="plus" label={t('grownups.children.add')} onPress={() => setAdding(true)} />
        )}
      </View>

      <SectionTitle>{t('grownups.sections.playing')}</SectionTitle>
      <Card style={styles.card}>
        <T v="bodyStrong">{t('grownups.playing.defaultMode')}</T>
        <Segmented
          testID="gu-mode"
          value={child?.playMode ?? 'real'}
          onChange={app.setPlayMode}
          options={[
            { value: 'real', label: t('common.modes.real.name'), icon: 'piano' },
            { value: 'screen', label: t('common.modes.screen.name'), icon: 'screen' },
          ]}
        />
        <T v="small">{t(`common.modes.${child?.playMode ?? 'real'}.description`)}</T>
        <T v="small">{t('grownups.playing.volumeHint')}</T>
        <T v="bodyStrong" style={{ marginTop: space.sm }}>
          {t('listen.settingTitle')}
        </T>
        <Segmented
          testID="listen-toggle"
          value={child?.listen === false ? 'off' : 'on'}
          onChange={(v) => child && app.updateChild(child.id, { listen: v === 'on' })}
          options={[
            { value: 'on', label: t('settings.on') },
            { value: 'off', label: t('settings.off') },
          ]}
        />
        <T v="small">{t('listen.settingBody')}</T>
        <T v="bodyStrong" style={{ marginTop: space.sm }}>
          {t('tutorial.settingTitle')}
        </T>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Button testID="tutorial-real" size="md" full={false} variant="secondary" icon="piano" label={t('common.modes.real.name')} onPress={() => router.push('/tutorial?mode=real&again=1' as never)} />
          <Button testID="tutorial-screen" size="md" full={false} variant="secondary" icon="screen" label={t('common.modes.screen.name')} onPress={() => router.push('/tutorial?mode=screen&again=1' as never)} />
        </View>
        <Button testID="reset-progress" variant="secondary" size="md" icon="restart" label={t('grownups.reset.button')} onPress={() => setConfirm('reset')} />
      </Card>

      <SectionTitle>{t('grownups.sections.subscription')}</SectionTitle>
      <Card style={styles.card} testID="sub-card">
        <T v="h3" testID="sub-status">
          {subTitle}
        </T>
        <T v="body">{subBody}</T>
        {!isEntitled(ent) ? (
          <Button testID="see-plans" label={t('grownups.subscription.seePlans')} onPress={() => router.push('/paywall' as never)} />
        ) : (
          <Button testID="manage-sub" variant="secondary" label={t('grownups.subscription.manage', { storeName: storeName() })} onPress={() => gate.requireGate('link', () => app.manageSubscription())} />
        )}
        <Button
          testID="restore"
          variant="secondary"
          size="md"
          label={t('grownups.subscription.restore')}
          onPress={async () => {
            const e = await app.restore();
            setMsg(e.active ? t('grownups.subscription.restoreDone') : `${t('errors.restoreNothingTitle')}.`);
          }}
        />
      </Card>

      <SectionTitle>{t('grownups.sections.account')}</SectionTitle>
      <Card style={styles.card}>
        {!authEnabled ? (
          <>
            <T v="h3">{t('grownups.account.guestTitle')}</T>
            <T v="body">{t('grownups.account.offBody')}</T>
          </>
        ) : user ? (
          <>
            <T v="h3">{t('grownups.account.signedIn', { email: user.email ?? '' })}</T>
            <T v="body">{t('grownups.account.syncOn')}</T>
            <T v="small">{t('grownups.children.nicknameNote')}</T>
            <Button variant="secondary" size="md" label={t('grownups.account.signOut')} onPress={() => setConfirm('signOut')} />
            <Button testID="delete-account" variant="ghost" size="md" label={t('grownups.account.delete')} onPress={() => setConfirm('delete')} />
          </>
        ) : (
          <>
            <T v="h3">{t('grownups.account.guestTitle')}</T>
            <T v="body">{t('grownups.account.guestBody')}</T>
            <Button variant="secondary" label={t('grownups.account.create')} onPress={() => router.push('/account' as never)} />
          </>
        )}
      </Card>

      <SectionTitle>{t('grownups.sections.privacy')}</SectionTitle>
      <Card style={styles.card}>
        <T v="h3">{t('grownups.privacy.summaryTitle')}</T>
        <T v="body">{t('grownups.privacy.summaryBody', { storeName: storeName() })}</T>
        <Button variant="secondary" size="md" label={t('grownups.privacy.policy')} onPress={() => gate.openExternal(config.links.privacy)} />
        <Button variant="secondary" size="md" label={t('grownups.privacy.terms')} onPress={() => gate.openExternal(config.links.terms)} />
        <Button testID="erase-device" variant="ghost" size="md" label={t('grownups.privacy.eraseDevice')} onPress={() => setConfirm('erase')} />
      </Card>

      <SectionTitle>{t('grownups.sections.help')}</SectionTitle>
      <Card style={styles.card}>
        <T v="body">{t('grownups.help.contactBody')}</T>
        <Button variant="secondary" size="md" icon="mail" label={t('grownups.help.contact')} onPress={() => gate.openExternal(config.links.support)} />
        <T v="h3" style={{ marginTop: space.sm }}>
          {t('grownups.help.faqTitle')}
        </T>
        {faq.map((f) => (
          <View key={f.q} style={{ gap: 2 }}>
            <T v="bodyStrong">{f.q}</T>
            <T v="body">{f.a}</T>
          </View>
        ))}
      </Card>

      <SectionTitle>{t('grownups.sections.about')}</SectionTitle>
      <Card style={styles.card} testID="about">
        <T v="bodyStrong">{t('grownups.about.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}</T>
        <T v="small" testID="public-domain-note">
          {t('settings.publicDomain')}
        </T>
        <T v="small">{t('grownups.about.credits')}</T>
        <T v="small" testID="audio-credit">
          {t('grownups.about.audioCredit')}
        </T>
        <T v="small">{t('grownups.about.fontCredit')}</T>
        <T v="small">{t('grownups.about.madeFor')}</T>
        <Button variant="secondary" size="md" label={t('grownups.about.licenses')} onPress={() => router.push('/licenses' as never)} />
      </Card>

      <View style={{ marginTop: space.xl }}>
        <Button
          testID="gu-lock"
          variant="dark"
          icon="lock"
          label={t('grownups.lock')}
          onPress={() => {
            gate.lock();
            setOpen(false);
            router.canGoBack() ? router.back() : router.replace('/' as never);
          }}
        />
      </View>

      <ConfirmSheet
        visible={confirm !== null}
        title={confirmText.title}
        body={confirmText.body}
        confirmLabel={confirmText.ok}
        cancelLabel={t('common.cancel')}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Screen>
  );
}

function fmtDay(s: string): string {
  const p = parseDay(s);
  return p ? new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : s;
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.extra, fontSize: 15, color: colors.brandEdge, textDecorationLine: 'underline' },
  bdayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, flexWrap: 'wrap', backgroundColor: colors.soft, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', paddingTop: space.lg },
  card: { gap: space.md },
  bigNum: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46, color: colors.ink },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.selectedSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink },
  input: { fontSize: 20 },
  ages: { flexDirection: 'row', gap: space.sm },
  age: { flex: 1, maxWidth: 88, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  ageOn: { backgroundColor: colors.surface, boxShadow: '0 10px 30px -5px rgba(30,42,58,0.08), 0 4px 12px -2px rgba(30,42,58,0.05)' },
  ageText: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
});
