"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/lib/notify";

export interface PortionOption {
  id: string;
  label: string;
  description?: string;
  priceDelta: number;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface FoodCustomization {
  portion: PortionOption;
  spiceLevel: "Mild" | "Medium" | "Hot";
  toppings: ToppingOption[];
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string; // Unique identifier including customizations
  id: number; // Base menu item id
  name: string;
  basePrice: number;
  price: number; // Dynamically computed total unit price (base + portion delta + toppings)
  image_url?: string;
  description?: string;
  badge?: string;
  category?: string;
  qty: number;
  customization?: FoodCustomization;
}

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
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Generate deterministic cart item ID for grouping identical items + customizations
export function generateCartItemId(itemId: number, customization?: FoodCustomization): string {
  if (!customization) {
    return String(itemId);
  }
  const portionKey = customization.portion?.id || "regular";
  const spiceKey = customization.spiceLevel || "Mild";
  const toppingsKey = (customization.toppings || [])
    .map((t) => t.id)
    .sort()
    .join("_");
  const notesKey = (customization.specialInstructions || "").trim().toLowerCase();
  return `${itemId}::${portionKey}::${spiceKey}::${toppingsKey}::${notesKey}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nimza-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize loaded items to ensure cartItemId and basePrice exist
        const normalized: CartItem[] = parsed.map((item: any) => ({
          cartItemId: item.cartItemId || String(item.id),
          id: item.id,
          name: item.name,
          basePrice: item.basePrice || item.price,
          price: Number(item.price),
          image_url: item.image_url,
          description: item.description,
          badge: item.badge,
          category: item.category,
          qty: item.qty || 1,
          customization: item.customization,
        }));
        setItems(normalized);
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

  const add = (item: any, customization?: FoodCustomization, initialQty = 1) => {
    if (item.is_available === false) {
      toast(`"${item.name}" is currently sold out`, "error");
      return;
    }

    const basePrice = Number(item.basePrice || item.price || 0);
    const portionDelta = customization?.portion?.priceDelta || 0;
    const toppingsSum = (customization?.toppings || []).reduce((sum, t) => sum + (t.price || 0), 0);
    const unitPrice = Number((basePrice + portionDelta + toppingsSum).toFixed(2));

    const cartItemId = generateCartItemId(item.id, customization);

    setItems((prev) => {
      const existingIndex = prev.findIndex((x) => x.cartItemId === cartItemId);
      if (existingIndex > -1) {
        return prev.map((x, idx) =>
          idx === existingIndex ? { ...x, qty: x.qty + initialQty } : x
        );
      }

      const newItem: CartItem = {
        cartItemId,
        id: item.id,
        name: item.name,
        basePrice,
        price: unitPrice,
        image_url: item.image_url,
        description: item.description,
        badge: item.badge,
        category: item.categories?.name || item.category,
        qty: initialQty,
        customization,
      };

      return [...prev, newItem];
    });

    toast(`Added "${item.name}" to cart`, "success");
  };

  const updateCustomization = (cartItemId: string, newCustomization: FoodCustomization) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((x) => x.cartItemId === cartItemId);
      if (targetIndex === -1) return prev;

      const target = prev[targetIndex];
      const basePrice = target.basePrice || target.price;
      const portionDelta = newCustomization.portion?.priceDelta || 0;
      const toppingsSum = (newCustomization.toppings || []).reduce((sum, t) => sum + (t.price || 0), 0);
      const newUnitPrice = Number((basePrice + portionDelta + toppingsSum).toFixed(2));
      const newCartItemId = generateCartItemId(target.id, newCustomization);

      // If another item with the exact same new customization exists, merge quantity
      const existingMatch = prev.find((x, i) => i !== targetIndex && x.cartItemId === newCartItemId);
      if (existingMatch) {
        return prev
          .filter((_, i) => i !== targetIndex)
          .map((x) => (x.cartItemId === newCartItemId ? { ...x, qty: x.qty + target.qty } : x));
      }

      // Otherwise update the item in place
      return prev.map((x, i) =>
        i === targetIndex
          ? {
              ...x,
              cartItemId: newCartItemId,
              price: newUnitPrice,
              customization: newCustomization,
            }
          : x
      );
    });

    toast("Customization updated successfully", "success");
  };

  const chg = (cartKey: string | number, delta: number) => {
    setItems((prev) =>
      prev
        .map((x) => {
          const isMatch = x.cartItemId === String(cartKey) || x.id === Number(cartKey);
          return isMatch ? { ...x, qty: x.qty + delta } : x;
        })
        .filter((x) => x.qty > 0)
    );
  };

  const remove = (cartKey: string | number) => {
    setItems((prev) =>
      prev.filter((x) => x.cartItemId !== String(cartKey) && x.id !== Number(cartKey))
    );
    toast("Item removed from cart", "info");
  };

  const clear = () => {
    setItems([]);
  };

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, add, updateCustomization, chg, remove, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
}
