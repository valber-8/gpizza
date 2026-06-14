import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMenu } from '../../src/hooks/useMenu';
import { useCartStore } from '../../src/store/cart';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useMenu();
  const addItem = useCartStore((s) => s.addItem);

  const item = data?.items.find((i) => i.id === id);

  if (isLoading) return <ActivityIndicator style={styles.center} size="large" color={Colors.primary} />;
  if (!item) return <Text style={styles.error}>Item not found.</Text>;

  return (
    <View style={styles.container}>
      <ScrollView>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>kr {item.price.toFixed(2)}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { addItem(item); router.back(); }}
      >
        <Text style={styles.addBtnText}>Add to cart · kr {item.price.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  image: { width: '100%', height: 240, resizeMode: 'cover' },
  content: { padding: Spacing.lg },
  name: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.text },
  price: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary, marginTop: Spacing.sm },
  description: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 24,
  },
  center: { flex: 1 },
  error: { textAlign: 'center', margin: Spacing.xl, color: Colors.error },
  addBtn: {
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
