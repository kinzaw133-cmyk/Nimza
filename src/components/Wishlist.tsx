"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { toast } from "@/lib/notify";

export interface WishlistItem {
  id: number; // Base menu_item_id
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

interface WishlistContextType {
  favorites: WishlistItem[];
  favoriteIds: Set<number>;
  count: number;
  loading: boolean;
  isFavorite: (itemId: number) => boolean;
  toggleFavorite: (item: any) => Promise<boolean>;
  removeFavorite: (itemId: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Storage key scoped to user account
  const getStorageKey = useCallback(() => {
    return user?.id ? `nimza_wishlist_${user.id}` : "nimza_wishlist_guest";
  }, [user]);

  // Read local backup cache
  const readLocalCache = useCallback((): WishlistItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }, [getStorageKey]);

  // Write local backup cache
  const writeLocalCache = useCallback((items: WishlistItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("nimza_wishlist_updated"));
    } catch {}
  }, [getStorageKey]);

  // Load favorites from Supabase and fallback to cache
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch live wishlist joined with menu items from Supabase
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          menu_item_id,
          created_at,
          menu_items (
            id,
            name,
            description,
            price,
            image_url,
            badge,
            category_id,
            is_available,
            ingredients,
            categories (
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        // Map joined data to clean WishlistItem objects
        const mapped: WishlistItem[] = [];
        const seenIds = new Set<number>();

        for (const row of data) {
          const menuItem = (row as any).menu_items;
          const itemId = row.menu_item_id || menuItem?.id;

          if (itemId && !seenIds.has(itemId) && menuItem) {
            seenIds.add(itemId);
            mapped.push({
              id: itemId,
              favorite_id: row.id,
              name: menuItem.name || "Special Dish",
              description: menuItem.description || "",
              price: Number(menuItem.price || 0),
              image_url: menuItem.image_url || "",
              badge: menuItem.badge || undefined,
              category_id: menuItem.category_id,
              category: menuItem.categories?.name || "Kitchen Special",
              is_available: menuItem.is_available !== false,
              ingredients: menuItem.ingredients || "",
              created_at: row.created_at,
            });
          }
        }

        setFavorites(mapped);
        writeLocalCache(mapped);
        setLoading(false);
        return;
      }
    } catch {
      // Ignore network errors and continue to local cache fallback
    }

    // Fallback: Read from local storage cache for this user
    const cached = readLocalCache();
    setFavorites(cached);
    setLoading(false);
  }, [user, readLocalCache, writeLocalCache]);

  useEffect(() => {
    loadFavorites();

    const handleUpdate = () => {
      const cached = readLocalCache();
      setFavorites(cached);
    };

    window.addEventListener("nimza_wishlist_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("nimza_wishlist_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadFavorites, readLocalCache]);

  // Set of favorite item IDs for instant O(1) lookups
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.id));
  }, [favorites]);

  const isFavorite = useCallback(
    (itemId: number) => {
      return favoriteIds.has(itemId);
    },
    [favoriteIds]
  );

  // Toggle favorite dish (Add or Remove)
  const toggleFavorite = useCallback(
    async (item: any): Promise<boolean> => {
      if (!item || !item.id) return false;

      // Unauthenticated protection: Prompt user to sign in
      if (!user) {
        toast("Please sign in to save dishes to your favorites", "info");
        // Optional quick redirect helper if on browser
        if (typeof window !== "undefined") {
          setTimeout(() => {
            const shouldLogin = window.confirm(
              "Would you like to sign in to sync your favorites across devices?"
            );
            if (shouldLogin) {
              window.location.href = "/login";
            }
          }, 400);
        }
        return false;
      }

      const itemId = Number(item.id);
      const isAlreadySaved = favoriteIds.has(itemId);

      if (isAlreadySaved) {
        // Remove from favorites
        const updated = favorites.filter((f) => f.id !== itemId);
        setFavorites(updated);
        writeLocalCache(updated);

        try {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("menu_item_id", itemId);
        } catch {
          // Local cache already updated
        }

        toast(`Removed "${item.name}" from favorites`, "info");
        return false;
      } else {
        // Prevent duplicates
        const newItem: WishlistItem = {
          id: itemId,
          name: item.name,
          description: item.description,
          price: Number(item.price || 0),
          image_url: item.image_url,
          badge: item.badge,
          category: item.categories?.name || item.category || "Specialty",
          category_id: item.category_id,
          is_available: item.is_available !== false,
          ingredients: item.ingredients,
          created_at: new Date().toISOString(),
        };

        const updated = [newItem, ...favorites.filter((f) => f.id !== itemId)];
        setFavorites(updated);
        writeLocalCache(updated);

        try {
          await supabase.from("favorites").upsert(
            {
              user_id: user.id,
              menu_item_id: itemId,
            },
            { onConflict: "user_id,menu_item_id" }
          );
        } catch {
          // Local cache already updated
        }

        toast(`Saved "${item.name}" to favorites`, "success");
        return true;
      }
    },
    [user, favoriteIds, favorites, writeLocalCache]
  );

  // Remove a specific favorite dish
  const removeFavorite = useCallback(
    async (itemId: number) => {
      if (!itemId) return;

      const target = favorites.find((f) => f.id === itemId);
      const updated = favorites.filter((f) => f.id !== itemId);
      setFavorites(updated);
      writeLocalCache(updated);

      if (user?.id) {
        try {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("menu_item_id", itemId);
        } catch {}
      }

      toast(target ? `Removed "${target.name}" from favorites` : "Dish removed from favorites", "info");
    },
    [user, favorites, writeLocalCache]
  );

  // Clear all favorites
  const clearFavorites = useCallback(async () => {
    setFavorites([]);
    writeLocalCache([]);

    if (user?.id) {
      try {
        await supabase.from("favorites").delete().eq("user_id", user.id);
      } catch {}
    }

    toast("Favorites list cleared", "info");
  }, [user, writeLocalCache]);

  const value = useMemo<WishlistContextType>(
    () => ({
      favorites,
      favoriteIds,
      count: favorites.length,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      refreshFavorites: loadFavorites,
    }),
    [
      favorites,
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
      loadFavorites,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
