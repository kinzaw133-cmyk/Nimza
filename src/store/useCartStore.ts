import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

export function calculateCustomizedPrice(basePrice: number, customization?: FoodCustomization): number {
  if (!customization) return basePrice;
  const portionDelta = customization.portion?.priceDelta || 0;
  const toppingsTotal = (customization.toppings || []).reduce((sum, t) => sum + (t.price || 0), 0);
  return Number((basePrice + portionDelta + toppingsTotal).toFixed(2));
}

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleCart: () => void;
  add: (item: any, customization?: FoodCustomization, initialQty?: number) => void;
  updateCustomization: (cartItemId: string, newCustomization: FoodCustomization) => void;
  chg: (cartKey: string | number, delta: number) => void;
  remove: (cartKey: string | number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (open: boolean) => set({ isOpen: open }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      add: (item: any, customization?: FoodCustomization, initialQty: number = 1) => {
        const basePrice = Number(item.basePrice || item.price || 0);
        const finalUnitPrice = calculateCustomizedPrice(basePrice, customization);
        const cartItemId = generateCartItemId(item.id, customization);

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          let newItems: CartItem[];

          if (existingIndex > -1) {
            newItems = state.items.map((i, idx) =>
              idx === existingIndex ? { ...i, qty: i.qty + initialQty } : i
            );
          } else {
            const newItem: CartItem = {
              cartItemId,
              id: item.id,
              name: item.name,
              basePrice,
              price: finalUnitPrice,
              image_url: item.image_url,
              description: item.description,
              badge: item.badge,
              category: item.category,
              qty: initialQty,
              customization,
            };
            newItems = [...state.items, newItem];
          }

          return { items: newItems };
        });

        const portionLabel = customization?.portion?.label ? ` (${customization.portion.label})` : "";
        toast(`Added ${item.name}${portionLabel} to your order.`, "success");
      },

      updateCustomization: (cartItemId: string, newCustomization: FoodCustomization) => {
        set((state) => {
          const itemIndex = state.items.findIndex((i) => i.cartItemId === cartItemId);
          if (itemIndex === -1) return state;

          const currentItem = state.items[itemIndex];
          const newCartItemId = generateCartItemId(currentItem.id, newCustomization);
          const newUnitPrice = calculateCustomizedPrice(currentItem.basePrice, newCustomization);

          const updatedItem: CartItem = {
            ...currentItem,
            cartItemId: newCartItemId,
            price: newUnitPrice,
            customization: newCustomization,
          };

          const duplicateIndex = state.items.findIndex(
            (i, idx) => idx !== itemIndex && i.cartItemId === newCartItemId
          );

          if (duplicateIndex > -1) {
            const mergedItems = state.items.filter((_, idx) => idx !== itemIndex);
            mergedItems[duplicateIndex] = {
              ...mergedItems[duplicateIndex],
              qty: mergedItems[duplicateIndex].qty + currentItem.qty,
            };
            return { items: mergedItems };
          } else {
            const updatedItems = [...state.items];
            updatedItems[itemIndex] = updatedItem;
            return { items: updatedItems };
          }
        });
        toast("Dish customization updated successfully.", "success");
      },

      chg: (cartKey: string | number, delta: number) => {
        const key = String(cartKey);
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.cartItemId === key || String(item.id) === key) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];

          return { items: newItems };
        });
      },

      remove: (cartKey: string | number) => {
        const key = String(cartKey);
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== key && String(i.id) !== key),
        }));
        toast("Removed item from order", "info");
      },

      clear: () => {
        set({ items: [] });
      },

      count: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      total: () => {
        return Number(
          get()
            .items.reduce((sum, item) => sum + item.price * item.qty, 0)
            .toFixed(2)
        );
      },
    }),
    {
      name: "nimza-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
