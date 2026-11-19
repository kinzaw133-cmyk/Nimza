"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Plus,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Utensils,
  Leaf,
  Star,
  XCircle,
  LogIn,
  Check,
} from "lucide-react";
import { useWishlist, WishlistItem } from "@/components/Wishlist";
import { useCart, FoodCustomization } from "@/components/Cart";
import { useAuth } from "@/lib/useAuth";
import Img from "@/components/Img";
import { toast, confirmDel } from "@/lib/notify";
import FoodCustomizationModal from "@/components/FoodCustomizationModal";
import NimzaLogo from "@/components/NimzaLogo";

export default function FavoritesPage() {
  const { favorites, count, loading, removeFavorite, clearFavorites } = useWishlist();
  const { add } = useCart();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customizingDish, setCustomizingDish] = useState<WishlistItem | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Extract unique categories present in the user's wishlist
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set)];
  }, [favorites]);

  // Filter items based on selected category tab
  const filteredFavorites = useMemo(() => {
    if (selectedCategory === "All") return favorites;
    return favorites.filter((item) => item.category === selectedCategory);
  }, [favorites, selectedCategory]);

  // Quick add to cart without customization
  const handleQuickAdd = (item: WishlistItem) => {
    if (item.is_available === false) {
      toast(`"${item.name}" is currently sold out`, "error");
      return;
    }
    add(item);
    toast(`Added "${item.name}" to your order`, "success");
  };

  // Open customization modal
  const handleOpenCustomize = (dish: WishlistItem) => {
    if (dish.is_available === false) {
      toast(`"${dish.name}" is currently sold out`, "error");
      return;
    }
    setCustomizingDish(dish);
    setIsCustomizeModalOpen(true);
  };

  // Handle confirm customization
  const handleConfirmCustomization = (customization: FoodCustomization, quantity: number) => {
    if (!customizingDish) return;
    add(customizingDish, customization, quantity);
    setIsCustomizeModalOpen(false);
    setCustomizingDish(null);
    toast(`Added ${quantity}x "${customizingDish.name}" (Customized) to cart`, "success");
  };

  // Add all available items in current view to cart
  const handleAddAllToCart = () => {
    const availableItems = filteredFavorites.filter((f) => f.is_available !== false);
    if (availableItems.length === 0) {
      toast("No available dishes to add", "info");
      return;
    }
    availableItems.forEach((item) => add(item));
    toast(`Added ${availableItems.length} favorite dishes to your cart!`, "success");
  };

  // Clear all with confirmation dialog
  const handleClearAll = async () => {
    const ok = await confirmDel("Remove all saved dishes from your favorites?");
    if (ok) {
      await clearFavorites();
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header Breadcrumb & Tag */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-4">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>Personal Tasting Wishlist</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1F241F] tracking-tight">
            Saved Favorites
          </h1>

          <p className="mt-4 text-charcoal/70 text-base md:text-lg font-light leading-relaxed">
            Your hand-curated selection of exquisite dishes, wood-fired cuts, and artisanal pairings.
          </p>

          {/* Unauthenticated Sync Advice Banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-200/70 text-amber-900 shrink-0">
                  <LogIn size={15} />
                </span>
                <span>
                  <strong>Browsing as guest:</strong> Sign in to sync your favorites across all your devices and access your table concierge.
                </span>
              </div>
              <Link
                href="/login"
                className="shrink-0 rounded-full bg-[#1F241F] hover:bg-gold hover:text-[#1F241F] text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Sign In Now
              </Link>
            </motion.div>
          )}
        </div>

        {/* Wishlist Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent mb-4" />
            <p className="font-serif text-charcoal/60 text-lg">Gathering your saved favorites...</p>
          </div>
        ) : count === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="max-w-xl mx-auto text-center py-16 px-8 rounded-[2.5rem] bg-white border border-sand shadow-sm"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-xs">
              <Heart size={36} className="text-rose-400 stroke-[1.5]" />
            </div>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1F241F]">
              Your Wishlist is Empty
            </h2>

            <p className="mt-3.5 text-sm md:text-base text-charcoal/70 leading-relaxed font-light">
              You haven&apos;t saved any dishes to your favorites yet. Tap the heart icon on any dish card across our menu to curate your personal tasting ritual.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/menu"
                className="btn !bg-gold hover:!bg-gold-light !text-[#1F241F] !py-3.5 !px-8 text-sm font-bold tracking-wider flex items-center justify-center gap-2 rounded-full shadow-md transition-all hover:scale-105"
              >
                <Utensils size={16} />
                <span>Explore Full Menu</span>
              </Link>
              <Link
                href="/"
                className="btn-o !border-sand !bg-white hover:!bg-sand/30 hover:!border-gold !text-[#1F241F] !py-3.5 !px-6 text-sm font-semibold tracking-wider flex items-center justify-center gap-2 rounded-full shadow-xs transition-all"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Wishlist Grid & Action Bar */
          <div className="space-y-8">
            {/* Top Toolbar / Category Filter & Bulk Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-sand shadow-xs">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-[#1F241F] text-gold shadow-sm"
                        : "bg-sand/30 text-charcoal/70 hover:bg-sand hover:text-charcoal"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Add All to Cart & Clear All */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider px-4 py-2.5 shadow-sm transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <ShoppingBag size={14} />
                  <span>Add All to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs uppercase tracking-wider px-3.5 py-2.5 transition-all flex items-center gap-1.5"
                  title="Clear all saved favorites"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Clear List</span>
                </button>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredFavorites.map((dish) => {
                  const isAvailable = dish.is_available !== false;

                  return (
                    <motion.article
                      key={dish.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, y: 15 }}
                      transition={{ duration: 0.3 }}
                      className="group relative overflow-hidden bg-white text-charcoal rounded-3xl border border-sand/80 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-gold/50 flex flex-col justify-between"
                    >
                      {/* Top Visual Image */}
                      <div>
                        <div className="relative h-56 w-full overflow-hidden bg-sand/20">
                          <Img
                            src={dish.image_url}
                            alt={dish.name}
                            className={`h-full w-full object-cover transition duration-700 ${
                              !isAvailable ? "grayscale-[35%] brightness-90" : "group-hover:scale-105"
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {!isAvailable ? (
                              <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                                <XCircle size={12} />
                                <span>Sold Out</span>
                              </span>
                            ) : dish.badge ? (
                              <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-[#1F241F] shadow-sm">
                                <Star size={11} fill="#1F241F" />
                                {dish.badge}
                              </span>
                            ) : null}

                            {dish.category && (
                              <span className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#1F241F] border border-sand shadow-sm">
                                <Utensils size={10} className="text-[#B99A5B]" />
                                {dish.category}
                              </span>
                            )}
                          </div>

                          {/* Remove from Wishlist Button (Top Right) */}
                          <button
                            type="button"
                            onClick={() => removeFavorite(dish.id)}
                            aria-label={`Remove ${dish.name} from favorites`}
                            className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur-md shadow-md border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 hover:scale-110 active:scale-95 transition-all"
                            title="Remove from favorites"
                          >
                            <Heart size={16} className="fill-rose-500 text-rose-500" />
                          </button>

                          {/* Price Badge */}
                          <div className="absolute bottom-3 right-3 rounded-full bg-[#1F241F]/90 backdrop-blur-md px-3.5 py-1 text-base font-serif font-bold text-gold border border-gold/30 shadow-md">
                            ${Number(dish.price).toFixed(2)}
                          </div>
                        </div>

                        {/* Dish Details */}
                        <div className="p-6">
                          <h3 className="font-serif text-2xl font-bold text-[#1F241F] group-hover:text-gold transition-colors">
                            {dish.name}
                          </h3>

                          <p className="mt-2 text-sm text-charcoal/70 leading-relaxed font-light line-clamp-2">
                            {dish.description || "Freshly prepared with seasonal ingredients by our executive kitchen brigade."}
                          </p>

                          {/* Ingredients */}
                          {dish.ingredients && (
                            <div className="mt-3.5 pt-3 border-t border-sand/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block mb-0.5">
                                Ingredients:
                              </span>
                              <p className="text-xs text-charcoal/75 italic line-clamp-2 font-serif">
                                {dish.ingredients}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions: Customize & Quick Add */}
                      <div className="p-6 pt-0 flex items-center gap-2">
                        {/* Customize Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenCustomize(dish)}
                          disabled={!isAvailable}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider border transition-all ${
                            !isAvailable
                              ? "border-sand/60 bg-sand/20 text-charcoal/40 cursor-not-allowed"
                              : "border-[#1F241F]/20 bg-white hover:border-gold hover:text-gold text-[#1F241F] shadow-xs active:scale-95"
                          }`}
                          title={isAvailable ? "Customize portion, spice & toppings" : "Sold out"}
                        >
                          <SlidersHorizontal size={13} className="text-gold shrink-0" />
                          <span>Customize</span>
                        </button>

                        {/* Quick Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(dish)}
                          disabled={!isAvailable}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            !isAvailable
                              ? "bg-sand/30 text-charcoal/40 cursor-not-allowed"
                              : "bg-gold hover:bg-gold-light text-[#1F241F] shadow-sm hover:scale-[1.02] active:scale-95"
                          }`}
                          title={isAvailable ? "Add directly to order" : "Sold out"}
                        >
                          <Plus size={14} className="shrink-0" />
                          <span>Add to Order</span>
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Food Customization */}
      {customizingDish && (
        <FoodCustomizationModal
          isOpen={isCustomizeModalOpen}
          onClose={() => {
            setIsCustomizeModalOpen(false);
            setCustomizingDish(null);
          }}
          dish={customizingDish}
          onSave={handleConfirmCustomization}
        />
      )}
    </main>
  );
}
