import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useCartStore } from '../../src/store/cart';
import { useT } from '../../src/i18n';
import { LangToggle } from '../../src/components/LangToggle';
import { Colors } from '../../src/constants/theme';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
}

export default function TabLayout() {
  const itemCount = useCartStore((s) => s.itemCount());
  const { t } = useT();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <LangToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_menu'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🍕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: t('tab_offers'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🏷️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: itemCount > 0 ? `${t('tab_cart')} (${itemCount})` : t('tab_cart'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tab_orders'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
