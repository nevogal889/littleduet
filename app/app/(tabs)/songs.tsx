import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SongCard } from '../../src/components/cards';
import { Icon } from '../../src/components/Icon';
import { Button, Chip, Screen, T } from '../../src/components/ui';
import { LESSONS, SONGS } from '../../src/data/catalog';
import { t } from '../../src/i18n';
import { AGE_GROUPS, DIFFICULTY_WORDS, ageGroupForAge, filterSongs, type DifficultyWord } from '../../src/lib/catalog';
import { songPercent } from '../../src/lib/progress';
import { useApp } from '../../src/state/store';
import { colors, fonts, radius, shadow, space, touch, useLayout } from '../../src/theme';
import type { AgeGroupId } from '../../src/types';

export default function Songs() {
  const router = useRouter();
  const { child, childData } = useApp();
  const { contentWidth, width } = useLayout();
  const [group, setGroup] = useState<AgeGroupId | null>(ageGroupForAge(child?.age ?? 3));
  const [level, setLevel] = useState<DifficultyWord | null>(null);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  const list = useMemo(() => filterSongs(SONGS, { ageGroup: group, difficulty: level, query }), [group, level, query]);
  const cols = width >= 1100 ? 5 : width >= 820 ? 4 : width >= 600 ? 3 : 2;
  const gap = space.lg;
  const cardW = Math.floor((contentWidth - gap * (cols - 1)) / cols);

  return (
    <Screen testID="songs">
      <T v="h1" accessibilityRole="header" style={{ paddingTop: space.xl }}>
        {t('songs.title')}
      </T>
      <View style={[styles.search, searchFocus && { borderColor: colors.focus }]}>
        <Icon name="search" size={26} color={colors.inkSoft} />
        <TextInput
          testID="songs-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('songs.searchPlaceholder')}
          placeholderTextColor={colors.inkSoft}
          accessibilityLabel={t('songs.searchPlaceholder')}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.searchInput}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />
      </View>

      <T v="bodyStrong" style={styles.label}>
        {t('songs.filterAges')}
      </T>
      <View style={styles.chips}>
        <Chip testID="age-all" label={t('songs.filterAllAges')} selected={group === null} onPress={() => setGroup(null)} />
        {AGE_GROUPS.map((g) => (
          <Chip key={g.id} testID={`age-${g.id}`} label={`${t(`ageGroups.${g.id}.label`)} ${g.ages}`} selected={group === g.id} onPress={() => setGroup(g.id)} />
        ))}
      </View>

      <T v="bodyStrong" style={styles.label}>
        {t('songs.filterLevel')}
      </T>
      <View style={styles.chips}>
        <Chip testID="level-any" label={t('songs.filterAnyLevel')} selected={level === null} onPress={() => setLevel(null)} />
        {DIFFICULTY_WORDS.map((w, i) => (
          <Chip key={w} testID={`level-${w}`} label={t(`difficultyWords.${w}`)} selected={level === w} onPress={() => setLevel(w)}>
            <View style={styles.levelDots}>
              {[0, 1, 2].map((d) => (
                <View key={d} style={[styles.levelDot, { backgroundColor: d <= i ? (level === w ? colors.white : colors.ink) : 'transparent', borderColor: level === w ? colors.white : colors.ink }]} />
              ))}
            </View>
          </Chip>
        ))}
      </View>

      <T v="small" style={{ marginTop: space.md }} accessibilityLiveRegion="polite">
        {t('songs.resultCount', { count: list.length })}
      </T>

      {list.length ? (
        <View style={[styles.grid, { gap }]} testID="songs-grid">
          {list.map((s) => (
            <SongCard key={s.id} song={s} lesson={LESSONS[s.id]} width={cardW} percent={songPercent(LESSONS[s.id], childData.progress)} onPress={() => router.push(`/song/${s.id}` as never)} />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <T v="body">{query ? t('empty.search', { query }) : t('empty.filters')}</T>
          <Button
            variant="secondary"
            size="md"
            label={t('empty.filtersCta')}
            onPress={() => {
              setQuery('');
              setGroup(null);
              setLevel(null);
            }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: touch.primary,
    marginTop: space.lg,
    paddingHorizontal: space.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.md,
    ...shadow.card,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, minHeight: touch.primary - 4, fontFamily: fonts.bold, fontSize: 17, color: colors.ink, outlineStyle: 'none' } as any,
  label: { marginTop: space.xl, marginBottom: space.sm },
  chips: { gap: space.sm, flexDirection: 'row', flexWrap: 'wrap' },
  levelDots: { flexDirection: 'row', gap: 3 },
  levelDot: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.md },
  empty: { gap: space.md, marginTop: space.xl },
});
