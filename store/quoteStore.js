import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuoteStore = create(
  persist(
    (set, get) => ({
      items: [],
     addItem: (product, qty = 1) => {
  const items = get().items;
  const existing = items.find((item) => item._id === product._id);

  if (existing) {
    set({
      items: items.map((item) =>
        item._id === product._id ? { ...item, qty: item.qty + qty } : item
      ),
    });
  } else {
    set({
      items: [...items, {
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || null,
        price: product.price, // ⚠️ මේ line එක add කරන්න — original product price එකම capture කරගන්නවා
        qty,
      }],
    });
  }
},
    
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item._id !== productId) });
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set({ items: get().items.map((item) => (item._id === productId ? { ...item, qty } : item)) });
      },

      clearQuote: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    { name: 'plc-quote-storage' }
  )
);