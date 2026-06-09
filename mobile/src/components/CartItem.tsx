import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';
import type { CartItem as CartItemType } from '../types';

interface Props {
  cartItem: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItem({ cartItem, onIncrement, onDecrement }: Props) {
  const { item, qty } = cartItem;
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.unitPrice}>R$ {item.price.toFixed(2)} cada</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={onDecrement}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{qty}</Text>
        <TouchableOpacity style={styles.btn} onPress={onIncrement}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.total}>R$ {(item.price * qty).toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  unitPrice: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  btn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '700' },
  qty: { fontSize: FontSize.md, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  total: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, minWidth: 60, textAlign: 'right' },
});
