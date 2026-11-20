import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/lib/notify";

export interface WishlistItem {
  id: number;
  favorite_id?: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  badge?: string;
  category?: string;
  category_id?: number;
  is_available?: boolean;
  ingredients?: string;
  dietary?: string;
  created_at?: string;
}

interface WishlistStoreState {
  favorites: WishlistItem[];
  toggleFavorite: (item: any) => boolean;
  removeFavorite: (itemId: number) => void;
  clearFavorites: () => void;
  isFavorite: (itemId: number) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (itemId: number) => {
        return get().favorites.some((f) => f.id === itemId);
      },

      toggleFavorite: (item: any) => {
        const id = Number(item.id);
        const exists = get().favorites.some((f) => f.id === id);

        if (exists) {
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== id),
          }));
          toast(`Removed "${item.name}" from your Wishlist.`, "info");
          return false;
        } else {
          const newItem: WishlistItem = {
            id,
            name: item.name,
            description: item.description,
            price: Number(item.price || 0),
            image_url: item.image_url,
            badge: item.badge,
            category: item.category,
            category_id: item.category_id,
            is_available: item.is_available ?? true,
            ingredients: item.ingredients,
            dietary: item.dietary,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            favorites: [newItem, ...state.favorites],
          }));
          toast(`Saved "${item.name}" to your Wishlist ❤️`, "success");
          return true;
        }
      },

      removeFavorite: (itemId: number) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== itemId),
        }));
      },

      clearFavorites: () => {
        set({ favorites: [] });
        toast("Wishlist cleared.", "info");
      },

      count: () => {
        return get().favorites.length;
      },
    }),
    {
      name: "nimza-wishlist-zustand",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
