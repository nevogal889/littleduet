import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { colors, radius, space } from '../theme';
import { Button, T } from './ui';

/** Plain in-app confirmation (no system alert): one primary action, one way back. */
export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityViewIsModal testID="confirm-sheet">
          <T v="h2" accessibilityRole="header">
            {title}
          </T>
          <T v="body">{body}</T>
          <Button testID="confirm-yes" label={confirmLabel} onPress={onConfirm} variant="dark" />
          <Button testID="confirm-no" label={cancelLabel} onPress={onCancel} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  card: { width: '100%', maxWidth: 520, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl, gap: space.lg },
});
