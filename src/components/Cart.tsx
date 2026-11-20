"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  useCartStore,
  CartItem,
  FoodCustomization,
  PortionOption,
  ToppingOption,
  generateCartItemId,
  calculateCustomizedPrice,
} from "@/store/useCartStore";

export type { PortionOption, ToppingOption, FoodCustomization, CartItem };
export { generateCartItemId, calculateCustomizedPrice };

interface CartContextType {
  items: CartItem[];
  add: (item: any, customization?: FoodCustomization, initialQty?: number) => void;
  updateCustomization: (cartItemId: string, newCustomization: FoodCustomization) => void;
  chg: (cartKey: string | number, delta: number) => void;
  remove: (cartKey: string | number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context) {
    return context;
  }
  // Fallback to direct Zustand store when used outside of Provider
  const store = useCartStore();
  return {
    items: store.items,
    add: store.add,
    updateCustomization: store.updateCustomization,
    chg: store.chg,
    remove: store.remove,
    clear: store.clear,
    count: store.count(),
    total: store.total(),
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const storeItems = useCartStore((state) => state.items);
  const storeAdd = useCartStore((state) => state.add);
  const storeUpdate = useCartStore((state) => state.updateCustomization);
  const storeChg = useCartStore((state) => state.chg);
  const storeRemove = useCartStore((state) => state.remove);
  const storeClear = useCartStore((state) => state.clear);

  // Client hydration check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = mounted ? storeItems : [];

  const count = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);

  const total = useMemo(() => {
    return Number(
      items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
    );
  }, [items]);

  const value: CartContextType = {
    items,
    add: storeAdd,
    updateCustomization: storeUpdate,
    chg: storeChg,
    remove: storeRemove,
    clear: storeClear,
    count,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
