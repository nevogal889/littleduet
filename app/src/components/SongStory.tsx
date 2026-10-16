import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import storiesJson from '../data/stories.json';
import { t } from '../i18n';
import { card, colors, fonts, radius, space, type } from '../theme';
import type { Song, SongStory } from '../types';
import { Icon } from './Icon';
import { T } from './ui';

const STORIES = storiesJson as unknown as Record<string, SongStory>;

export function storyFor(songId: string): SongStory | undefined {
  return STORIES[songId];
}

/** "About this song": a kid line up front, who / when / where, and "Read more" for grown-ups. */
export function SongStoryCard({ song }: { song: Song }) {
  const [open, setOpen] = useState(false);
  const st = storyFor(song.id);
  const facts = st
    ? [
        { k: t('story.writtenBy'), v: st.writtenBy },
        { k: t('story.when'), v: st.year },
        { k: t('story.from'), v: st.origin },
      ].filter((f) => f.v)
    : [];
  return (
    <View style={styles.card} testID="song-story">
      <View style={styles.head}>
        <View style={styles.badge}>
          <Icon name="songs" size={20} color={colors.brand} />
        </View>
        <T v="h3" accessibilityRole="header">
          {t('song.aboutTitle')}
        </T>
      </View>
      {st ? <Text style={styles.kid}>{st.aboutKids}</Text> : song.origin ? <T v="body">{song.origin}</T> : null}
      {facts.length ? (
        <View style={styles.facts}>
          {facts.map((f) => (
            <View key={f.k} style={styles.fact}>
              <Text style={type.meta}>{f.k}</Text>
              <Text style={styles.factV}>{f.v}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {open ? (
        <View style={{ gap: space.sm }} testID="song-story-more">
          {st?.story ? <T v="body">{st.story}</T> : null}
          {st?.funFact ? (
            <View style={styles.fun}>
              <Text style={[type.meta, { color: colors.ink }]}>{t('story.funFact')}</Text>
              <T v="bodyStrong">{st.funFact}</T>
            </View>
          ) : null}
          {st?.myth ? (
            <View style={styles.myth}>
              <Text style={[type.meta, { color: colors.ink }]}>{t('story.myth')}</Text>
              <T v="body">{st.myth}</T>
            </View>
          ) : null}
        </View>
      ) : null}
      {st || song.origin ? (
        <Pressable testID="song-story-toggle" accessibilityRole="button" onPress={() => setOpen((v) => !v)} style={styles.more} hitSlop={8}>
          <Text style={styles.moreText}>{open ? t('story.less') : t('story.more')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...card, padding: space.lg, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  kid: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 27, color: colors.ink },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  fact: { minWidth: 120, flexShrink: 1, gap: 2 },
  factV: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.ink },
  fun: { backgroundColor: colors.goldSoft, padding: space.md, borderRadius: radius.md, gap: 4 },
  myth: { backgroundColor: colors.blueSoft, padding: space.md, borderRadius: radius.md, gap: 4 },
  more: { alignSelf: 'flex-start' },
  moreText: { fontFamily: fonts.extra, fontSize: 16, color: colors.brandEdge, textDecorationLine: 'underline' },
});
