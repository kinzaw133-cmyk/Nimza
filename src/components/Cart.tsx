"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/lib/notify";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  badge?: string;
  category?: string;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  add: (item: any) => void;
  chg: (id: number, delta: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nimza-cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nimza-cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const add = (item: any) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          image_url: item.image_url,
          description: item.description,
          badge: item.badge,
          category: item.categories?.name,
          qty: 1,
        },
      ];
    });
    toast(`Added "${item.name}" to cart`, "success");
  };

  const chg = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast("Item removed from cart", "info");
  };

  const clear = () => {
    setItems([]);
  };

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, chg, remove, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}
