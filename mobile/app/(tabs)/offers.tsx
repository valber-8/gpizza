import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useOffers } from '../../src/hooks/useOffers';
import { OfferCard } from '../../src/components/OfferCard';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';

export default function OffersScreen() {
  const { data, isLoading, error } = useOffers();

  if (isLoading) {
    return <ActivityIndicator style={styles.center} size="large" color={Colors.primary} />;
  }
  if (error) {
    return <Text style={styles.error}>Failed to load offers.</Text>;
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => <OfferCard offer={item} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyText}>No active offers at the moment</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md },
  center: { flex: 1 },
  error: { color: Colors.error, textAlign: 'center', margin: Spacing.xl },
  empty: { alignItems: 'center', marginTop: Spacing.xl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.lg },
});
