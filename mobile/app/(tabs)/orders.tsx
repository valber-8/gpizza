import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useOrder } from '../../src/hooks/useOrder';
import { OrderStatusStepper } from '../../src/components/OrderStatusStepper';
import { useT } from '../../src/i18n';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';

export default function OrdersScreen() {
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [orderId, setOrderId] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: order, isLoading, error } = useOrder(activeId);
  const { t } = useT();

  useEffect(() => {
    if (prefill) {
      setOrderId(prefill);
      setActiveId(prefill);
    }
  }, [prefill]);

  function handleTrack() {
    const trimmed = orderId.trim().toUpperCase();
    if (trimmed) setActiveId(trimmed);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('track_heading')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ex: ORD-1717823400"
          value={orderId}
          onChangeText={setOrderId}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
          <Text style={styles.trackBtnText}>{t('search')}</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />}
      {error && <Text style={styles.error}>{t('order_not_found')}</Text>}

      {order && (
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>{order.order_id}</Text>
            <Text style={styles.orderType}>
              {order.order_type === 'delivery' ? `🛵 ${t('delivery_type')}` : `🏪 ${t('pickup_type')}`}
            </Text>
          </View>

          <OrderStatusStepper status={order.status} />

          <View style={styles.itemsList}>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.orderItem}>
                <Text style={styles.orderItemName}>
                  {item.qty}x {item.name}
                </Text>
                <Text style={styles.orderItemPrice}>
                  kr {(item.qty * item.unit_price).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>{t('total')}</Text>
              <Text style={styles.orderTotalValue}>kr {Number(order.total).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', marginBottom: Spacing.md, color: Colors.text },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    backgroundColor: Colors.surface,
  },
  trackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  error: { color: Colors.error, textAlign: 'center', fontSize: FontSize.md, marginTop: Spacing.md },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderId: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  orderType: { fontSize: FontSize.md, color: Colors.textSecondary },
  itemsList: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.md,
  },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  orderItemName: { fontSize: FontSize.md, color: Colors.text },
  orderItemPrice: { fontSize: FontSize.md, color: Colors.textSecondary },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  orderTotalLabel: { fontSize: FontSize.lg, fontWeight: '700' },
  orderTotalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
});
