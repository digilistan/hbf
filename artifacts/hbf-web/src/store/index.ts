import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderItem } from '@workspace/api-client-react';

export interface CartItem extends OrderItem {
  id: string; // internal cart id
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (newItem) => set((state) => {
        const existing = state.items.find(i => i.itemId === newItem.itemId);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.itemId === newItem.itemId 
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
            isOpen: true
          };
        }
        return { 
          items: [...state.items, { ...newItem, id: crypto.randomUUID() }],
          isOpen: true
        };
      }),
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter(i => i.itemId !== itemId)
      })),
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: quantity <= 0 
          ? state.items.filter(i => i.itemId !== itemId)
          : state.items.map(i => i.itemId === itemId ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }),
    { name: 'hbf_cart' }
  )
);

interface AuthState {
  customerToken: string | null;
  customerUser: { name?: string; email: string } | null;
  adminToken: string | null;
  adminUser: { email: string; role?: string } | null;
  setCustomerAuth: (token: string, user: { name?: string; email: string }) => void;
  setAdminAuth: (token: string, user: { email: string; role?: string }) => void;
  logoutCustomer: () => void;
  logoutAdmin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customerToken: null,
      customerUser: null,
      adminToken: null,
      adminUser: null,
      setCustomerAuth: (token, user) => set({ customerToken: token, customerUser: user }),
      setAdminAuth: (token, user) => set({ adminToken: token, adminUser: user }),
      logoutCustomer: () => set({ customerToken: null, customerUser: null }),
      logoutAdmin: () => set({ adminToken: null, adminUser: null }),
    }),
    { name: 'hbf_auth' }
  )
);

interface OrderState {
  latestOrder: any | null;
  setLatestOrder: (order: any) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  latestOrder: null,
  setLatestOrder: (order) => set({ latestOrder: order }),
}));
