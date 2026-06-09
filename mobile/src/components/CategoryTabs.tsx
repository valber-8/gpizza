import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';
import type { Category } from '../types';

const ICONS: Record<string, string> = {
  Pizzas: '🍕',
  Bebidas: '🥤',
  Sobremesas: '🍰',
  Entradas: '🥗',
  Combos: '🎁',
  Bordas: '🧀',
};

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const active = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onSelect(cat)}
          >
            <Text style={styles.icon}>{ICONS[cat] ?? '🍽️'}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  icon: { fontSize: 16 },
  label: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  labelActive: { color: '#fff' },
});
