import React from 'react';
import { useRouter } from 'expo-router';
import { Button, Screen, T } from '../src/components/ui';
import { t } from '../src/i18n';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <T v="h1">{t('errors.genericTitle')}</T>
      <Button label={t('celebration.backHome')} onPress={() => router.replace('/' as never)} />
    </Screen>
  );
}
