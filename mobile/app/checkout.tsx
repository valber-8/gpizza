import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '../src/store/cart';
import { placeOrder } from '../src/api/orders';
import { Colors, FontSize, Radius, Spacing } from '../src/constants/theme';
import type { OrderType } from '../src/types';

export default function CheckoutScreen() {
  const { items, offerCode, discount, subtotal, total, clearCart } = useCartStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Dados obrigatórios', 'Por favor preencha nome e telefone.');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      Alert.alert('Endereço necessário', 'Informe o endereço para entrega.');
      return;
    }

    setLoading(true);
    try {
      const result = await placeOrder({
        customer_name: name.trim(),
        phone: phone.trim(),
        items: items.map((c) => ({
          id: c.item.id,
          name: c.item.name,
          qty: c.qty,
          unit_price: c.item.price,
        })),
        order_type: orderType,
        delivery_address: address.trim() || undefined,
        offer_code: offerCode || undefined,
        notes: notes.trim() || undefined,
      });

      clearCart();
      router.replace({
        pathname: '/order-confirmed',
        params: {
          order_id: result.order_id,
          total: result.total.toFixed(2),
          estimated: result.estimated_minutes.toString(),
        },
      });
    } catch (e: any) {
      Alert.alert('Erro ao realizar pedido', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.section}>Tipo de pedido</Text>
        <View style={styles.typeRow}>
          {(['pickup', 'delivery'] as OrderType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, orderType === t && styles.typeBtnActive]}
              onPress={() => setOrderType(t)}
            >
              <Text style={[styles.typeBtnText, orderType === t && styles.typeBtnTextActive]}>
                {t === 'pickup' ? '🏪 Retirada' : '🛵 Entrega'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Seus dados</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone (WhatsApp)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {orderType === 'delivery' && (
          <>
            <Text style={styles.section}>Endereço de entrega</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Rua, número, bairro"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </>
        )}

        <Text style={styles.section}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Ex: sem cebola, ponto da carne..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text>R$ {subtotal().toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Desconto</Text>
              <Text style={{ color: Colors.success }}>− R$ {discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total().toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Confirmar pedido</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  section: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeBtnText: { fontWeight: '700', color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.primaryDark },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  summary: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { color: Colors.textSecondary },
  totalRow: {
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  totalLabel: { fontSize: FontSize.xl, fontWeight: '700' },
  totalValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
