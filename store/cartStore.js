import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((item) => item._id === product._id);

        if (existing) {
          // දැනටමත් cart එකේ තියෙනවා නම්, qty එක වැඩි කරනවා (stock limit එකට වඩා යන්නෙ නෑ)
          set({
            items: items.map((item) =>
              item._id === product._id
                ? { ...item, qty: Math.min(item.qty + qty, product.stock_qty) }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.images?.[0] || null,
                stock_qty: product.stock_qty,
                qty,
              },
            ],
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
        set({
          items: get().items.map((item) =>
            item._id === productId ? { ...item, qty } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: 'plc-cart-storage', // localStorage key
    }
  )
);