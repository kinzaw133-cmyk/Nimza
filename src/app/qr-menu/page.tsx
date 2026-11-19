"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  ShoppingBag,
  Sparkles,
  Flame,
  Search,
  Check,
  Plus,
  SlidersHorizontal,
  BellRing,
  Droplets,
  Receipt,
  Heart,
  ChevronRight,
  Info,
  AlertCircle,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart, FoodCustomization } from "@/components/Cart";
import { useWishlist } from "@/components/Wishlist";
import { toast } from "@/lib/notify";
import NimzaLogo from "@/components/NimzaLogo";
import FoodCustomizationModal from "@/components/FoodCustomizationModal";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Starters" },
  { id: 2, name: "Main Course" },
  { id: 3, name: "Desserts" },
  { id: 4, name: "Drinks" },
];

const DEFAULT_ITEMS = [
  {
    id: 1,
    category_id: 1,
    name: "Garden Harvest Bowl",
    description: "Seasonal tender leaves, wild herbs, shaved radishes, and cold-pressed citrus dressing.",
    ingredients: "Baby spinach, wild arugula, heirloom radishes, Amalfi lemon, cold-pressed olive oil",
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
    ingredients: "Handmade semolina pasta, Umbrian black winter truffles, 36-month Parmigiano-Reggiano",
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
    ingredients: "45-day dry-aged beef, bone marrow glaze, heritage carrots, fresh thyme jus",
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
    ingredients: "San Marzano D.O.P. tomatoes, Fior di Latte mozzarella, sweet Genovese basil",
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
    ingredients: "70% Guanaja chocolate, Madagascar vanilla bean ice cream, caramel spun lace",
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
    ingredients: "Sicilian blood orange juice, wild rosemary, sparkling San Pellegrino water, herbal bitters",
    price: 7.0,
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    badge: "Zero Proof",
    dietary: "Vegan",
    is_available: true,
  },
];

const TABLE_SECTIONS: Record<number, string> = {
  1: "Window Terrace",
  2: "Window Terrace",
  3: "Window Terrace",
  4: "Grand Dining Hall",
  5: "Grand Dining Hall",
  6: "Grand Dining Hall",
  7: "Garden Veranda",
  8: "Garden Veranda",
  9: "Private Wine Vault",
  10: "Private Wine Vault",
  11: "Chef's Counter VIP",
  12: "Royal Salon",
};

function QRMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTableParam = searchParams.get("table");

  const [tableNumber, setTableNumber] = useState<number>(() => {
    if (rawTableParam && !isNaN(Number(rawTableParam))) {
      return Number(rawTableParam);
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nimza_active_table");
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return 3; // Default table
  });

  const { items: cartItems, add, count: cartCount, total: cartTotal } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [menuItems, setMenuItems] = useState<any[]>(DEFAULT_ITEMS);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [customizingDish, setCustomizingDish] = useState<any | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Sync table parameter with storage and state
  useEffect(() => {
    if (rawTableParam && !isNaN(Number(rawTableParam))) {
      const num = Number(rawTableParam);
      setTableNumber(num);
      try {
        localStorage.setItem("nimza_active_table", String(num));
      } catch {}
    }
  }, [rawTableParam]);

  // Load latest live menu items from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadMenu() {
      try {
        const { data: catData } = await supabase.from("categories").select("*").order("id");
        if (catData && catData.length > 0 && isMounted) setCategories(catData);

        const { data: itemData } = await supabase.from("menu_items").select("*").order("id");
        if (itemData && itemData.length > 0 && isMounted) setMenuItems(itemData);
      } catch {}
    }
    loadMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  const tableName = `Table #${tableNumber}`;
  const sectionName = TABLE_SECTIONS[tableNumber] || "Dining Salon";

  // Filter items
  const filteredDishes = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCat = selectedCat === 0 || item.category_id === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [menuItems, selectedCat, searchQuery]);

  const handleOpenCustomize = (dish: any) => {
    if (dish.is_available === false) {
      toast(`"${dish.name}" is currently sold out`, "error");
      return;
    }
    setCustomizingDish(dish);
    setIsCustomizeModalOpen(true);
  };

  const handleSaveCustomization = (customization: FoodCustomization, qty: number) => {
    if (!customizingDish) return;
    add(customizingDish, customization, qty);
    toast(`Added ${qty}× ${customizingDish.name} to Table #${tableNumber} order`, "success");
  };

  const handleQuickAdd = (dish: any) => {
    if (dish.is_available === false) {
      toast(`"${dish.name}" is currently sold out`, "error");
      return;
    }
    add(dish);
    toast(`Added ${dish.name} to Table #${tableNumber} order`, "success");
  };

  const handleCallWaiter = (type: "waiter" | "water" | "bill") => {
    const titles = {
      waiter: `Service request notified for Table #${tableNumber}. A server will visit you shortly.`,
      water: `Fresh ice water requested for Table #${tableNumber}.`,
      bill: `Bill presentation requested for Table #${tableNumber}.`,
    };
    toast(titles[type], "info");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#1F241F] pt-24 pb-36 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Table Recognition Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 bg-charcoal text-sand border-2 border-gold/60 shadow-xl mb-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <QrCode size={180} />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-charcoal font-black text-xl shadow-md">
              {tableNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                  {tableName}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  QR Table Active
                </span>
              </div>
              <p className="text-xs text-sand/70 font-sans flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-gold" /> {sectionName} • Nimza Fine Dining
              </p>
            </div>
          </div>

          {/* Quick Table-Side Server Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCallWaiter("waiter")}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-gold hover:text-charcoal text-xs font-semibold border border-sand/20 transition-all flex items-center gap-1.5"
              title="Call server to table"
            >
              <BellRing size={13} className="text-gold" />
              <span>Call Server</span>
            </button>
            <button
              onClick={() => handleCallWaiter("water")}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-gold hover:text-charcoal text-xs font-semibold border border-sand/20 transition-all flex items-center gap-1.5"
              title="Request water"
            >
              <Droplets size={13} className="text-cyan-400" />
              <span>Water</span>
            </button>
            <button
              onClick={() => handleCallWaiter("bill")}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-gold hover:text-charcoal text-xs font-semibold border border-sand/20 transition-all flex items-center gap-1.5"
              title="Request check"
            >
              <Receipt size={13} className="text-sand" />
              <span>Bill</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Header & Search */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F241F]">
            Table-Side Digital Menu
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Browse our chef's hand-crafted courses, customize dishes, and order directly to the kitchen pass.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes or ingredients (e.g. Truffle, Ribeye, Burrata)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-sand focus:border-gold focus:outline-none text-xs sm:text-sm text-charcoal shadow-xs"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat(0)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === 0
                ? "bg-[#1F241F] text-gold shadow-md"
                : "bg-white border border-sand text-charcoal/80 hover:bg-sand/30"
            }`}
          >
            All Courses ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#1F241F] text-gold shadow-md"
                    : "bg-white border border-sand text-charcoal/80 hover:bg-sand/30"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredDishes.map((dish) => {
          const isSoldOut = dish.is_available === false;
          const favorited = isFavorite(dish.id);

          return (
            <div
              key={dish.id}
              className={`rounded-3xl bg-white border border-sand p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isSoldOut ? "opacity-60 bg-sand/10" : ""
              }`}
            >
              <div>
                {/* Image and Badges */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 bg-sand/30">
                  <img
                    src={dish.image_url || "/images/placeholder.jpg"}
                    alt={dish.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Dietary / Signature Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {dish.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1F241F]/80 backdrop-blur-xs text-gold border border-gold/30">
                        {dish.badge}
                      </span>
                    )}
                    {dish.dietary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 backdrop-blur-xs text-olive shadow-xs">
                        {dish.dietary}
                      </span>
                    )}
                  </div>

                  {/* Sold Out Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md">
                        Sold Out Today
                      </span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    onClick={() => toggleFavorite(dish)}
                    className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur-xs grid place-items-center text-charcoal hover:text-rose-500 shadow-sm transition-colors"
                    title="Save to Favorites"
                  >
                    <Heart
                      size={15}
                      className={favorited ? "fill-rose-500 text-rose-500" : "text-charcoal/70"}
                    />
                  </button>
                </div>

                {/* Dish Info */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-[#1F241F] leading-snug">
                      {dish.name}
                    </h3>
                    <span className="font-serif text-base font-bold text-olive shrink-0">
                      ${Number(dish.price).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  {dish.ingredients && (
                    <p className="text-[11px] text-charcoal/50 italic line-clamp-1 pt-1">
                      Ingredients: {dish.ingredients}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Customize & Add to Cart */}
              <div className="mt-4 pt-3 border-t border-sand/60 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => handleOpenCustomize(dish)}
                  className="py-2 px-3 rounded-xl border border-sand bg-sand/30 hover:border-gold hover:bg-gold/15 text-xs font-bold text-charcoal transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal size={13} className="text-gold" />
                  <span>Customize</span>
                </button>

                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => handleQuickAdd(dish)}
                  className="py-2 px-3 rounded-xl bg-gold hover:bg-gold-light text-charcoal font-bold text-xs shadow-xs transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>+ Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Table Cart Summary Bar */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:max-w-md sm:w-full sm:mx-auto z-40 bg-charcoal text-sand rounded-3xl p-4 shadow-2xl border-2 border-gold/80 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gold text-charcoal font-bold shadow-md">
              <ShoppingBag size={20} />
              <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow">
                {cartCount}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gold font-bold block">
                {tableName} Order
              </span>
              <span className="font-serif text-base font-bold text-white">
                ${cartTotal.toFixed(2)} Subtotal
              </span>
            </div>
          </div>

          <Link
            href={`/cart?table=${tableNumber}`}
            className="py-2.5 px-4 rounded-2xl bg-gold text-charcoal hover:bg-gold-light font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Review &amp; Place</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Food Customization Modal */}
      {customizingDish && (
        <FoodCustomizationModal
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setCustomizingDish(null);
          }}
          dish={customizingDish}
          onSave={handleSaveCustomization}
        />
      )}
    </main>
  );
}

export default function QRMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-[#FAFAF8] text-charcoal">
          <div className="flex flex-col items-center gap-3">
            <NimzaLogo variant="circle" size="md" />
            <p className="font-serif text-base font-bold text-olive animate-pulse">
              Loading Table-Side Digital Menu...
            </p>
          </div>
        </div>
      }
    >
      <QRMenuContent />
    </Suspense>
  );
}
