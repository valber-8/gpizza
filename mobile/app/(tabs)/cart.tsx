import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '../../src/store/cart';
import { CartItem } from '../../src/components/CartItem';
import { validateOfferCode } from '../../src/api/offers';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';

export default function CartScreen() {
  const { items, offerCode, discount, addItem, removeItem, updateQty, setOffer, subtotal, total } =
    useCartStore();
  const [codeInput, setCodeInput] = useState('');
  const [applying, setApplying] = useState(false);

  async function handleApplyCode() {
    if (!codeInput.trim()) return;
    setApplying(true);
    try {
      const result = await validateOfferCode(codeInput.trim(), subtotal());
      setOffer(codeInput.trim().toUpperCase(), result.discount);
      Alert.alert('Oferta aplicada!', `Desconto de R$ ${result.discount.toFixed(2)}`);
    } catch (e: any) {
      Alert.alert('Código inválido', e.message);
    } finally {
      setApplying(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
          <Text style={styles.browseBtnText}>Ver cardápio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {items.map((ci) => (
          <CartItem
            key={ci.item.id}
            cartItem={ci}
            onIncrement={() => addItem(ci.item)}
            onDecrement={() => updateQty(ci.item.id, ci.qty - 1)}
            onRemove={() => removeItem(ci.item.id)}
          />
        ))}

        <View style={styles.offerRow}>
          <TextInput
            style={styles.codeInput}
            placeholder="Código de desconto"
            value={codeInput}
            onChangeText={setCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCode} disabled={applying}>
            {applying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyBtnText}>Aplicar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R$ {subtotal().toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>
                Desconto ({offerCode})
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                − R$ {discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total().toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
        <Text style={styles.checkoutBtnText}>Finalizar pedido · R$ {total().toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 56 },
  emptyText: { fontSize: FontSize.xl, color: Colors.textSecondary },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
  offerRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  codeInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    backgroundColor: Colors.surface,
  },
  applyBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: 'center',
    minWidth: 80,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  summary: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  totalRow: {
    borderTopWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  totalLabel: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
