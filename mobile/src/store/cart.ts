import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  offerCode: string;
  discount: number;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  setOffer: (code: string, discount: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      offerCode: '',
      discount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((c) => c.item.id === item.id);
          if (existing) {
            return {
              items: state.items.map((c) =>
                c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c
              ),
            };
          }
          return { items: [...state.items, { item, qty: 1 }] };
        }),

      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((c) => c.item.id !== itemId) })),

      updateQty: (itemId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((c) => c.item.id !== itemId) };
          return { items: state.items.map((c) => (c.item.id === itemId ? { ...c, qty } : c)) };
        }),

      setOffer: (code, discount) => set({ offerCode: code, discount }),

      clearCart: () => set({ items: [], offerCode: '', discount: 0 }),

      subtotal: () => get().items.reduce((sum, c) => sum + c.item.price * c.qty, 0),

      total: () => Math.max(0, get().subtotal() - get().discount),

      itemCount: () => get().items.reduce((sum, c) => sum + c.qty, 0),
    }),
    {
      name: 'gpizza-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
