import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ParentalGate, useGate } from '../src/components/ParentalGate';
import { Paywall } from '../src/components/Paywall';
import { BackButton, Screen } from '../src/components/ui';
import { classById } from '../src/data/catalog';
import { t } from '../src/i18n';
import { space } from '../src/theme';

/** Always behind the parental gate (Apple 1.3), even when opened directly. */
export default function PaywallRoute() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const router = useRouter();
  const gate = useGate();
  const [passed, setPassed] = useState(gate.isUnlocked());
  const hit = classId ? classById(String(classId)) : undefined;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/' as never));

  return (
    <Screen testID="paywall-screen" edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <BackButton onPress={close} label={t('common.close')} testID="paywall-close" />
      </View>
      {passed ? (
        <Paywall
          songTitle={hit?.song.title}
          moreClasses={hit ? hit.lesson.classes.length - 1 : undefined}
          onLater={close}
          onDone={close}
        />
      ) : (
        <ParentalGate
          purpose="paywall"
          onCancel={close}
          onPass={() => {
            gate.unlock();
            setPassed(true);
          }}
        />
      )}
    </Screen>
  );
}
