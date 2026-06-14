import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../i18n';
import { Colors, FontSize, Spacing } from '../constants/theme';
import type { OrderStatus } from '../types';

interface Props {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: Props) {
  const { t } = useT();

  const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
    { key: 'pending',   label: t('status_received'),  icon: '📋' },
    { key: 'confirmed', label: t('status_confirmed'), icon: '✅' },
    { key: 'preparing', label: t('status_preparing'), icon: '👨‍🍳' },
    { key: 'ready',     label: t('status_ready'),     icon: '🍕' },
    { key: 'delivered', label: t('status_delivered'), icon: '🎉' },
  ];

  if (status === 'cancelled') {
    return (
      <View style={styles.cancelled}>
        <Text style={styles.cancelledText}>❌ {t('order_cancelled')}</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        const active = idx === currentIndex;
        return (
          <View key={step.key} style={styles.step}>
            <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
              <Text style={styles.icon}>{step.icon}</Text>
            </View>
            {idx < STEPS.length - 1 && (
              <View style={[styles.line, idx < currentIndex && styles.lineDone]} />
            )}
            <Text style={[styles.label, active && styles.labelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md },
  step: { alignItems: 'center', flex: 1 },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.primaryLight },
  dotActive: { backgroundColor: Colors.primary },
  icon: { fontSize: 20 },
  line: {
    position: 'absolute',
    top: 22,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.border,
  },
  lineDone: { backgroundColor: Colors.primary },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  labelActive: { color: Colors.primary, fontWeight: '700' },
  cancelled: { alignItems: 'center', padding: Spacing.lg },
  cancelledText: { fontSize: FontSize.lg, color: Colors.error, fontWeight: '700' },
});
