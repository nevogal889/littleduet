import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t, tList } from '../i18n';
import { birthYears, daysInMonth, parseDay, toDay } from '../lib/birthday';
import { colors, fonts, radius, space, type } from '../theme';

/**
 * Tap-only birthday picker: year chips, a 4x3 month grid, then a day grid.
 * value/onChange use 'YYYY-MM-DD'; partial picks are kept in local state until the day is chosen.
 */
export function BirthdayPicker({ value, onChange, testID = 'bday' }: { value?: string; onChange: (v: string | undefined) => void; testID?: string }) {
  const init = parseDay(value);
  const [y, setY] = React.useState<number | null>(init?.[0] ?? null);
  const [m, setM] = React.useState<number | null>(init?.[1] ?? null);
  const [d, setD] = React.useState<number | null>(init?.[2] ?? null);
  const months = tList('birthday.months');
  const years = birthYears(Date.now());

  const emit = (yy: number | null, mm: number | null, dd: number | null) => {
    if (yy && mm && dd && dd <= daysInMonth(yy, mm)) onChange(toDay(yy, mm, dd));
    else onChange(undefined);
  };
  const pickY = (v: number) => {
    setY(v);
    const dd = d && m && d > daysInMonth(v, m) ? null : d;
    setD(dd);
    emit(v, m, dd);
  };
  const pickM = (v: number) => {
    setM(v);
    const dd = d && y && d > daysInMonth(y, v) ? null : d;
    setD(dd);
    emit(y, v, dd);
  };
  const pickD = (v: number) => {
    setD(v);
    emit(y, m, v);
  };
  const nDays = y && m ? daysInMonth(y, m) : 31;

  return (
    <View style={{ gap: space.md }} testID={testID}>
      <Text style={type.meta}>{t('birthday.year')}</Text>
      <View style={styles.wrap} accessibilityRole="radiogroup">
        {years.map((v) => (
          <Chip key={v} label={String(v)} on={y === v} onPress={() => pickY(v)} testID={`${testID}-y-${v}`} wide />
        ))}
      </View>
      <Text style={type.meta}>{t('birthday.month')}</Text>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {months.map((label, i) => (
          <Chip key={label} label={label} on={m === i + 1} onPress={() => pickM(i + 1)} testID={`${testID}-m-${i + 1}`} cols={4} />
        ))}
      </View>
      <Text style={type.meta}>{t('birthday.day')}</Text>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {Array.from({ length: nDays }, (_, i) => i + 1).map((v) => (
          <Chip key={v} label={String(v)} on={d === v} onPress={() => pickD(v)} testID={`${testID}-d-${v}`} cols={7} small />
        ))}
      </View>
    </View>
  );
}

function Chip({ label, on, onPress, testID, cols, wide, small }: { label: string; on: boolean; onPress: () => void; testID: string; cols?: number; wide?: boolean; small?: boolean }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: on, selected: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        cols ? { width: `${100 / cols - 2}%` as unknown as number } : null,
        wide && styles.wide,
        small && styles.small,
        on && styles.on,
        pressed && !on && { backgroundColor: colors.selectedSoft },
      ]}
    >
      <Text style={[styles.text, small && { fontSize: 15 }, on && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' },
  chip: { height: 48, borderRadius: radius.md, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  wide: { paddingHorizontal: space.md, minWidth: 76 },
  small: { height: 42 },
  on: { backgroundColor: colors.ink },
  text: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
});
