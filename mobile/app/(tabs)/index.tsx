import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMenu } from '../../src/hooks/useMenu';
import { useCartStore } from '../../src/store/cart';
import { MenuItemCard } from '../../src/components/MenuItemCard';
import { CategoryTabs } from '../../src/components/CategoryTabs';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';

export default function MenuScreen() {
  const { data, isLoading, error } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const categories = data?.categories ?? [];
  const items = data?.items ?? [];
  const activeCategory = selectedCategory || categories[0] || '';
  const filtered = items.filter((i) => i.category === activeCategory);

  if (isLoading) {
    return <ActivityIndicator style={styles.center} size="large" color={Colors.primary} />;
  }
  if (error) {
    return <Text style={styles.error}>Erro ao carregar cardápio. Tente novamente.</Text>;
  }

  return (
    <View style={styles.container}>
      <CategoryTabs
        categories={categories}
        selected={activeCategory}
        onSelect={setSelectedCategory}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
            onAdd={() => addItem(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum item disponível nesta categoria</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md },
  center: { flex: 1 },
  error: { color: Colors.error, textAlign: 'center', margin: Spacing.xl, fontSize: FontSize.md },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xl },
});
