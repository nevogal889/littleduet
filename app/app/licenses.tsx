import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BackButton, Card, Screen, T } from '../src/components/ui';
import { t } from '../src/i18n';
import { space } from '../src/theme';

const LICENSES = [
  {
    name: 'Salamander Grand Piano (piano samples)',
    text: 'Alexander Holm. Licensed under Creative Commons Attribution 3.0 (CC BY 3.0), creativecommons.org/licenses/by/3.0. Samples were trimmed and converted to MP3 for this app.',
  },
  {
    name: 'Bricolage Grotesque, DM Sans (fonts)',
    text: 'Licensed under the SIL Open Font License, Version 1.1 (openfontlicense.org). The fonts may be used, bundled and redistributed with software; they may not be sold on their own.',
  },
  {
    name: 'Open-source software',
    text: 'Built with Expo, React Native, react-native-svg, expo-video, expo-audio, AsyncStorage and the RevenueCat and Supabase SDKs (MIT and Apache 2.0 licenses). Full license texts ship with each package.',
  },
];

export default function Licenses() {
  const router = useRouter();
  return (
    <Screen testID="licenses">
      <View style={{ paddingTop: space.sm }}>
        <BackButton onPress={() => router.back()} label={t('common.back')} />
      </View>
      <T v="h1" accessibilityRole="header">
        {t('grownups.about.licenses')}
      </T>
      <View style={{ gap: space.md, marginTop: space.lg }}>
        {LICENSES.map((l) => (
          <Card key={l.name} style={{ gap: space.sm }}>
            <T v="h3">{l.name}</T>
            <T v="body">{l.text}</T>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
