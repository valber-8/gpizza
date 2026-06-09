import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '../src/constants/theme';

export default function OrderConfirmedScreen() {
  const { order_id, total, estimated } = useLocalSearchParams<{
    order_id: string;
    total: string;
    estimated: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Pedido confirmado!</Text>
      <Text style={styles.subtitle}>
        Seu pedido foi recebido e está sendo preparado.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Número do pedido</Text>
          <Text style={styles.value}>{order_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>R$ {total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tempo estimado</Text>
          <Text style={styles.value}>{estimated} minutos</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.trackBtn}
        onPress={() =>
          router.push({ pathname: '/(tabs)/orders', params: { prefill: order_id } })
        }
      >
        <Text style={styles.trackBtnText}>Acompanhar pedido</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.menuBtnText}>Voltar ao cardápio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  label: { color: Colors.textSecondary, fontSize: FontSize.md },
  value: { fontWeight: '700', fontSize: FontSize.md, color: Colors.text },
  trackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
  menuBtn: { marginTop: Spacing.md, paddingVertical: Spacing.md, width: '100%', alignItems: 'center' },
  menuBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.lg },
});
