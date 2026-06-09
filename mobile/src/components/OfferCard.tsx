import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';
import type { Offer } from '../types';

interface Props {
  offer: Offer;
}

export function OfferCard({ offer }: Props) {
  const discount =
    offer.type === 'percent'
      ? `${offer.value}% OFF`
      : offer.type === 'fixed'
      ? `R$ ${offer.value.toFixed(2)} OFF`
      : 'Item grátis';

  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{discount}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{offer.title}</Text>
        <Text style={styles.description}>{offer.description}</Text>
        {offer.code ? (
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Código: </Text>
            <Text style={styles.code}>{offer.code}</Text>
          </View>
        ) : null}
        {offer.min_order > 0 ? (
          <Text style={styles.min}>Pedido mínimo: R$ {offer.min_order.toFixed(2)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: FontSize.md, textAlign: 'center' },
  content: { flex: 1, padding: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  codeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  code: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    letterSpacing: 1,
  },
  min: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
});
