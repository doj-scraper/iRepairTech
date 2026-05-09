import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/schema';

interface CartStore {
  readonly items: ReadonlyArray<CartItem>;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, type: CartItem['type']) => void;
  updateQuantity: (id: string, type: CartItem['type'], quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.type === item.type,
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.type === item.type
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (id, type) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.type === type)),
        })),

      updateQuantity: (id, type, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !(i.id === id && i.type === type))
              : state.items.map((i) =>
                  i.id === id && i.type === type ? { ...i, quantity } : i,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'irepair-cart',
      version: 1,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
