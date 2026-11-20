"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { preloadImages } from "@/lib/imageCache";

export const DEFAULT_CATEGORIES = [
  { id: 1, name: "Starters" },
  { id: 2, name: "Main Course" },
  { id: 3, name: "Desserts" },
  { id: 4, name: "Drinks" },
];

export const DEFAULT_ITEMS = [
  {
    id: 1,
    category_id: 1,
    name: "Garden Harvest Bowl",
    description: "Seasonal tender leaves, wild herbs, shaved radishes, and cold-pressed citrus dressing.",
    ingredients: "Baby spinach, wild arugula, heirloom radishes, cold-pressed Amalfi lemon, extra virgin olive oil",
    price: 11.0,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    badge: "Organic",
    dietary: "Vegan",
    is_available: true,
  },
  {
    id: 2,
    category_id: 1,
    name: "Burrata Pugliese",
    description: "Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.",
    ingredients: "Artisanal buffalo burrata, heirloom confit tomatoes, basil oil, grilled sourdough",
    price: 14.0,
    image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80",
    badge: "Chef's Pick",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 3,
    category_id: 2,
    name: "Truffle Tagliatelle",
    description: "Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.",
    ingredients: "Handmade semolina pasta, Umbrian black winter truffles, 36-month aged Parmigiano-Reggiano, churned butter",
    price: 18.0,
    image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    badge: "Top Pick",
    dietary: "Hand-Crafted",
    is_available: true,
  },
  {
    id: 4,
    category_id: 2,
    name: "Grilled Ribeye Prime",
    description: "300g heritage dry-aged beef, bone marrow glaze, roasted heritage carrots, thyme jus.",
    ingredients: "45-day dry-aged beef, roasted bone marrow glaze, glazed heritage carrots, fresh thyme jus",
    price: 29.0,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    badge: "Wood-Fired",
    dietary: "Gluten-Free",
    is_available: true,
  },
  {
    id: 5,
    category_id: 2,
    name: "Pan-Seared Herb Salmon",
    description: "Wild Scottish salmon, champagne beurre blanc, braised fennel, sea greens.",
    ingredients: "Wild Scottish salmon, champagne beurre blanc, braised Florence fennel, sea samphire",
    price: 22.0,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    badge: "Wild Catch",
    dietary: "Gluten-Free",
    is_available: true,
  },
  {
    id: 6,
    category_id: 2,
    name: "Wood-Fired Margherita",
    description: "San Marzano D.O.P. tomatoes, buffalo mozzarella, fresh sweet basil, extra virgin olive oil.",
    ingredients: "San Marzano D.O.P. tomatoes, fresh Fior di Latte mozzarella, sweet Genovese basil, organic olive oil",
    price: 15.0,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    badge: "Classic",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 7,
    category_id: 3,
    name: "Tiramisu al Mascarpone",
    description: "Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.",
    ingredients: "Single-origin espresso, Savoiardi ladyfingers, sweet mascarpone cream, Valrhona cocoa",
    price: 9.0,
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    badge: "Chef's Recipe",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 8,
    category_id: 3,
    name: "Molten Valrhona Sphere",
    description: "Warm dark chocolate ganache cake, Madagascar bourbon vanilla ice cream, golden lace.",
    ingredients: "70% Guanaja chocolate, Madagascar bourbon vanilla bean ice cream, caramel spun lace",
    price: 10.0,
    image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    badge: "Signature",
    dietary: "Vegetarian",
    is_available: true,
  },
  {
    id: 9,
    category_id: 4,
    name: "Blood Orange Citrus Spritz",
    description: "Sicilian blood orange, wild garden rosemary, sparkling mineral water, botanical bitters.",
    ingredients: "Fresh Sicilian blood orange juice, wild garden rosemary sprig, sparkling San Pellegrino water, herbal bitters",
    price: 7.0,
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    badge: "Zero Proof",
    dietary: "Vegan",
    is_available: true,
  },
];

export interface MenuQueryResult {
  categories: any[];
  items: any[];
}

/**
 * High-performance TanStack Query hook for restaurant menu catalog.
 * Delivers INSTANT 0ms page rendering via placeholder cache, and background stale-while-revalidate.
 */
export function useMenuQuery() {
  const queryClient = useQueryClient();

  const query = useQuery<MenuQueryResult>({
    queryKey: ["menu_catalog"],
    queryFn: async () => {
      try {
        let cats = DEFAULT_CATEGORIES;
        let items = DEFAULT_ITEMS;

        // Only query Supabase when valid URL is present, preventing dead DNS/network wait
        if (isSupabaseConfigured) {
          const [catsRes, itemsRes] = await Promise.all([
            supabase.from("categories").select("*").order("id"),
            supabase.from("menu_items").select("*,categories(name)").order("id"),
          ]);
          if (catsRes.data && catsRes.data.length > 0) {
            cats = catsRes.data;
          }
          if (itemsRes.data && itemsRes.data.length > 0) {
            items = itemsRes.data;
          }
        }

        let localOverride: any[] = [];
        try {
          const stored = localStorage.getItem("nimza_menu_items");
          if (stored) localOverride = JSON.parse(stored);
        } catch {}

        if (localOverride.length > 0) {
          items = items.map((dbItem: any) => {
            const override = localOverride.find((l) => l.id === dbItem.id);
            return override ? { ...dbItem, ...override } : dbItem;
          });
        }

        // Background preload all dish images into browser cache
        const imageUrls = items.map((i) => i.image_url).filter(Boolean);
        preloadImages(imageUrls, 600);

        return { categories: cats, items };
      } catch {
        return { categories: DEFAULT_CATEGORIES, items: DEFAULT_ITEMS };
      }
    },
    // 5 minutes stale time for instantaneous tab switching
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: {
      categories: DEFAULT_CATEGORIES,
      items: DEFAULT_ITEMS,
    },
  });

  // Listen for realtime Supabase changes only when properly configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("query-menu-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        queryClient.invalidateQueries({ queryKey: ["menu_catalog"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        queryClient.invalidateQueries({ queryKey: ["menu_catalog"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    categories: query.data?.categories || DEFAULT_CATEGORIES,
    items: query.data?.items || DEFAULT_ITEMS,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

/**
 * TanStack Query hook for Admin Dashboard Overview
 */
export function useAdminOverviewQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin_overview"],
    queryFn: async () => {
      try {
        if (!isSupabaseConfigured) {
          return {
            orders: [],
            reservations: [],
            menuCount: { items: 14, categories: 4 },
          };
        }

        const [ordersRes, resRes, itemsCountRes, catsCountRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*,order_items(quantity,menu_items(name,price))")
            .order("id", { ascending: false })
            .limit(20),
          supabase.from("reservations").select("*").order("reserved_at", { ascending: true }).limit(20),
          supabase.from("menu_items").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
        ]);

        return {
          orders: ordersRes.data || [],
          reservations: resRes.data || [],
          menuCount: {
            items: itemsCountRes.count || 14,
            categories: catsCountRes.count || 4,
          },
        };
      } catch {
        return {
          orders: [],
          reservations: [],
          menuCount: { items: 14, categories: 4 },
        };
      }
    },
    staleTime: 60 * 1000, // 1 minute fresh cache
    gcTime: 10 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
