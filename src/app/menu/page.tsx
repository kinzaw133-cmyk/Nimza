"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Search,
  Star,
  Sparkles,
  Filter,
  Check,
  ShoppingBag,
  Utensils,
  ChefHat,
  Leaf,
  Flame,
  Clock,
  ArrowUpDown,
  XCircle,
  AlertCircle,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart, FoodCustomization } from "@/components/Cart";
import { useWishlist } from "@/components/Wishlist";
import { useAuth } from "@/lib/useAuth";
import dynamic from "next/dynamic";
import Img from "@/components/Img";
import { toast } from "@/lib/notify";
import { BotanicalLeafSvg } from "@/components/NimzaLogo";
import AiRecommendations from "@/components/AiRecommendations";
import { useMenuQuery } from "@/lib/queryHooks";

// Lazy-load modal to reduce initial page weight
const FoodCustomizationModal = dynamic(() => import("@/components/FoodCustomizationModal"), {
  ssr: false,
});

export default function Menu() {
  const { add } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { isAdmin } = useAuth();
  const { items, categories: cats, refetch } = useMenuQuery();
  const [selectedCat, setSelectedCat] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "available">("featured");
  const [customizingDish, setCustomizingDish] = useState<any | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get("table");
    const storedTable = localStorage.getItem("nimza_active_table");
    const found = tableParam || storedTable;
    if (found && !isNaN(Number(found))) {
      setActiveTable(Number(found));
      try {
        localStorage.setItem("nimza_active_table", String(found));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleCustomSync = () => refetch();
    window.addEventListener("nimza_menu_updated", handleCustomSync);
    window.addEventListener("storage", handleCustomSync);

    return () => {
      window.removeEventListener("nimza_menu_updated", handleCustomSync);
      window.removeEventListener("storage", handleCustomSync);
    };
  }, [refetch]);

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
  };

  const handleQuickAdd = (item: any) => {
    if (item.is_available === false) {
      toast(`"${item.name}" is currently sold out`, "error");
      return;
    }
    add(item);
  };

  const filtered = items
    .filter((item) => {
      const matchCat = !selectedCat || item.category_id === selectedCat;
      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.ingredients && item.ingredients.toLowerCase().includes(q));
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "available") {
        const aAvail = a.is_available !== false ? 1 : 0;
        const bAvail = b.is_available !== false ? 1 : 0;
        return bAvail - aAvail;
      }
      return 0;
    });

  const handleAdd = (item: any) => {
    if (item.is_available === false) {
      toast(`"${item.name}" is currently sold out`, "error");
      return;
    }
    add(item);
    toast(`Added "${item.name}" to your order`, "success");
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-charcoal pt-36 pb-28 px-6 md:px-12 relative overflow-hidden">
      {/* Subtle Luxury Ambient Glow */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gold/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-sand/30 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Active QR Table Service Banner */}
        {activeTable && (
          <div className="max-w-3xl mx-auto mb-10 p-4 rounded-3xl bg-charcoal text-sand border-2 border-gold/70 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-charcoal font-black text-lg shadow">
                {activeTable}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-white text-base">
                    Table #{activeTable} Digital Menu
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    QR Dine-In Active
                  </span>
                </div>
                <p className="text-xs text-sand/70 mt-0.5">
                  Orders placed will be dispatched directly to Table #{activeTable}.
                </p>
              </div>
            </div>
            <Link
              href={`/cart?table=${activeTable}`}
              className="px-4 py-2 rounded-2xl bg-gold text-charcoal hover:bg-gold-light text-xs font-bold shadow transition-all shrink-0"
            >
              View Table Cart →
            </Link>
          </div>
        )}
        {/* Header Title with Botanical Emblem */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1F241F] shadow-sm mb-4">
            <Sparkles size={14} className="text-gold" />
            <span>The Daily Harvest</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#1F241F]">
            Culinary Collection
          </h1>
          <p className="mt-4 text-charcoal/70 text-base md:text-lg font-light leading-relaxed">
            Every dish is made strictly to order using seasonal ingredients from our trusted organic growers.
          </p>

          {isAdmin && (
            <div className="mt-5">
              <Link
                href="/admin/menu"
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-1.5 text-xs font-bold text-[#1F241F] hover:bg-gold hover:text-charcoal transition-all shadow-sm"
              >
                <ChefHat size={14} className="text-gold" />
                <span>Executive: Manage Dishes & Pricing in Menu Studio ↗</span>
              </Link>
            </div>
          )}
        </div>

        {/* AI Culinary Sommelier & Taste Profile Matcher */}
        <AiRecommendations />

        {/* Toolbar: Category Filter Pills, Search Bar, and Sorter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12 pb-8 border-b border-sand">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[{ id: 0, name: "All Dishes" }, ...cats].map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`rounded-full px-5 py-2 text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1F241F] text-gold font-bold shadow-md scale-105"
                      : "bg-white border border-sand text-charcoal/80 hover:border-gold hover:text-charcoal shadow-sm"
                  }`}
                >
                  <Utensils size={13} className={isSelected ? "text-gold" : "text-charcoal/40"} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search flavours or ingredients..."
                className="w-full rounded-full border border-sand bg-white pl-9 pr-4 py-2.5 text-xs md:text-sm text-charcoal outline-none placeholder:text-charcoal/40 focus:border-gold focus:ring-2 focus:ring-gold/20 shadow-sm transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded-full border border-sand bg-white pl-4 pr-8 py-2.5 text-xs md:text-sm text-charcoal outline-none focus:border-gold cursor-pointer shadow-sm appearance-none font-medium"
              >
                <option value="featured">Featured</option>
                <option value="available">Available First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40" />
            </div>
          </div>
        </div>

        {/* Dishes Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-charcoal/60 bg-white rounded-3xl border border-sand shadow-sm">
            <Utensils size={40} className="mx-auto text-gold mb-3 opacity-60" />
            <p className="text-xl font-serif text-[#1F241F]">No dishes match your search criteria.</p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCat(0);
              }}
              className="btn mt-6 !text-xs !py-2.5 inline-flex items-center gap-2"
            >
              <Filter size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((item) => {
                const isItemAvailable = item.is_available !== false;

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45 }}
                    className={`group relative overflow-hidden bg-white text-charcoal rounded-3xl border border-sand/80 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-gold/50 flex flex-col justify-between ${
                      !isItemAvailable ? "opacity-90" : ""
                    }`}
                  >
                    {/* Image & Badges */}
                    <div>
                      <div className="relative h-60 w-full overflow-hidden bg-sand/20">
                        <Img
                          src={item.image_url}
                          alt={item.name}
                          className={`h-full w-full object-cover transition duration-700 ${
                            !isItemAvailable ? "grayscale-[35%] brightness-90" : "group-hover:scale-105"
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          {!isItemAvailable ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                              <XCircle size={12} />
                              <span>Sold Out</span>
                            </span>
                          ) : item.badge ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-[#1F241F] shadow-sm">
                              <Star size={11} fill="#1F241F" />
                              {item.badge}
                            </span>
                          ) : null}

                          {item.dietary && (
                            <span className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#1F241F] border border-sand shadow-sm">
                              <Leaf size={11} className="text-emerald-700" />
                              {item.dietary}
                            </span>
                          )}
                        </div>

                        {/* Heart-Shaped Favorite Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                          aria-label={
                            isFavorite(item.id)
                              ? `Remove ${item.name} from favorites`
                              : `Add ${item.name} to favorites`
                          }
                          className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur-md shadow-md border border-sand/80 hover:scale-110 active:scale-90 transition-all duration-200"
                          title={isFavorite(item.id) ? "In your favorites (click to remove)" : "Save to favorites"}
                        >
                          <Heart
                            size={16}
                            className={`transition-all duration-300 ${
                              isFavorite(item.id)
                                ? "fill-rose-500 text-rose-500 scale-110"
                                : "text-charcoal/50 hover:text-rose-500"
                            }`}
                          />
                        </button>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 rounded-full bg-[#1F241F]/90 backdrop-blur-md px-3.5 py-1 text-base font-serif font-bold text-gold border border-gold/30 shadow-md">
                          ${Number(item.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#B99A5B]">
                            <Utensils size={12} />
                            <span>{item.categories?.name || "Nimza Kitchen"}</span>
                          </div>
                          {!isItemAvailable && (
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              Unavailable Today
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-[#1F241F] group-hover:text-gold transition-colors">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-sm text-charcoal/70 leading-relaxed font-light line-clamp-2">
                          {item.description}
                        </p>

                        {/* Ingredients Tag Section */}
                        {item.ingredients && (
                          <div className="mt-3.5 pt-3 border-t border-sand/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block mb-1">
                              Key Ingredients:
                            </span>
                            <p className="text-xs text-charcoal/75 italic line-clamp-2 font-serif">
                              {item.ingredients}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order & Customize Action Buttons in Footer */}
                    <div className="p-6 pt-0 flex items-center gap-2">
                      <button
                        disabled={!isItemAvailable}
                        onClick={() => handleOpenCustomize(item)}
                        className={`flex-1 rounded-full py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          !isItemAvailable
                            ? "bg-sand/40 text-charcoal/40 cursor-not-allowed border border-sand"
                            : "bg-[#1F241F] text-white hover:bg-gold hover:text-[#1F241F] shadow-sm hover:shadow-gold/20 active:scale-95"
                        }`}
                      >
                        {!isItemAvailable ? (
                          <>
                            <XCircle size={15} />
                            <span>Currently Sold Out</span>
                          </>
                        ) : (
                          <>
                            <SlidersHorizontal size={14} className="text-gold" />
                            <span>Customize & Add</span>
                          </>
                        )}
                      </button>

                      {isItemAvailable && (
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item)}
                          title="Quick Add with Standard Recipe"
                          className="p-3 rounded-full border border-sand bg-[#FAF9F5] hover:bg-gold hover:text-[#1F241F] text-charcoal transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Food Customization Modal */}
      <FoodCustomizationModal
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setCustomizingDish(null);
        }}
        dish={customizingDish}
        mode="add"
        onSave={handleSaveCustomization}
      />
    </main>
  );
}
