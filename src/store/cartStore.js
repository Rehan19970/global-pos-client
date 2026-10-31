import { create } from 'zustand';

const useCartStore = create((set) => ({
  cart: [],
  customer: null,
  
  setCustomer: (customer) => set({ customer }),
  
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find((item) => item._id === product._id);
    if (existingItem) {
      return {
        cart: state.cart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, qty: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item._id !== productId),
  })),

  updateQty: (productId, qty) => set((state) => ({
    cart: state.cart.map((item) =>
      item._id === productId ? { ...item, qty: Number(qty) } : item
    ),
  })),

  clearCart: () => set({ cart: [], customer: null }),
}));

export default useCartStore;