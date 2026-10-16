import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { colors, fonts, space } from '../theme';
import { Icon, type IconName } from './Icon';

const TABS: { href: string; key: string; icon: IconName; a11y?: string }[] = [
  { href: '/', key: 'home', icon: 'home' },
  { href: '/songs', key: 'songs', icon: 'songs' },
  { href: '/stickers', key: 'stickers', icon: 'star' },
  { href: '/grownups', key: 'grownups', icon: 'grownups', a11y: 'a11y.grownUpsButton' },
];

/** Big labelled tabs (>= 64 px tall), no hidden gestures. */
export function TabBar() {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const on = tab.href === '/' ? path === '/' || path === '/index' : path.startsWith(tab.href);
        return (
          <Pressable
            key={tab.key}
            testID={`tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tab.a11y ? t(tab.a11y) : t(`tabs.${tab.key}`)}
            onPress={() => router.navigate(tab.href as never)}
            style={({ pressed }) => [styles.tab, pressed && { backgroundColor: colors.indigoSoft }]}
          >
            <View style={[styles.indicator, on && { backgroundColor: colors.coral }]} />
            <Icon name={tab.icon} size={30} color={on ? colors.coralInk : colors.inkSoft} />
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
              {t(`tabs.${tab.key}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tab: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 6 },
  indicator: { position: 'absolute', top: 0, width: 48, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  label: { fontFamily: fonts.medium, fontSize: 17, color: colors.inkSoft },
  labelOn: { fontFamily: fonts.bold, color: colors.ink },
});
