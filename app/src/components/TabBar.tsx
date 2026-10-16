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
  { href: '/stickers', key: 'stickers', icon: 'starOutline' },
  { href: '/grownups', key: 'grownups', icon: 'grownups', a11y: 'a11y.grownUpsButton' },
];

/** Line icons + labels; the active tab gets a tinted icon on a light rounded background. */
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
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}
          >
            <View style={[styles.pill, on && styles.pillOn]}>
              <Icon name={tab.icon} size={26} color={on ? colors.brand : colors.inkSoft} />
              <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                {t(`tabs.${tab.key}`)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 2, borderTopColor: colors.line, paddingTop: 6, paddingHorizontal: space.sm },
  tab: { flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'stretch', marginHorizontal: 4, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 2, paddingVertical: 6, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  pillOn: { backgroundColor: colors.brandSoft, borderColor: '#F9C2B6' },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  labelOn: { fontFamily: fonts.extra, color: colors.ink },
});
