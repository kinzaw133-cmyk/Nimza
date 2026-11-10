"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Search, Star, Sparkles, Filter, Check, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/Cart";
import Img from "@/components/Img";
import { toast } from "@/lib/notify";
import { BotanicalLeafSvg } from "@/components/NimzaLogo";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Starters" },
  { id: 2, name: "Mains" },
  { id: 3, name: "Desserts" },
  { id: 4, name: "Drinks & Cellar" },
];

const DEFAULT_ITEMS = [
  {
    id: 1,
    category_id: 1,
    name: "Garden Harvest Bowl",
    description: "Seasonal tender leaves, wild herbs, shaved radishes, and cold-pressed citrus dressing.",
    price: 11.0,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    badge: "Organic",
    dietary: "Vegan",
  },
  {
    id: 2,
    category_id: 1,
    name: "Burrata Pugliese",
    description: "Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.",
    price: 14.0,
    image_url: "https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80",
    badge: "Chef's Pick",
    dietary: "Vegetarian",
  },
  {
    id: 3,
    category_id: 2,
    name: "Truffle Tagliatelle",
    description: "Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.",
    price: 18.0,
    image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    badge: "Top Pick",
    dietary: "Hand-Crafted",
  },
  {
    id: 4,
    category_id: 2,
    name: "Grilled Ribeye Prime",
    description: "300g heritage dry-aged beef, bone marrow glaze, roasted heritage carrots, thyme jus.",
    price: 29.0,
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    badge: "Wood-Fired",
    dietary: "Gluten-Free",
  },
  {
    id: 5,
    category_id: 2,
    name: "Pan-Seared Herb Salmon",
    description: "Wild Scottish salmon, champagne beurre blanc, braised fennel, sea greens.",
    price: 22.0,
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    badge: "Wild Catch",
    dietary: "Gluten-Free",
  },
  {
    id: 6,
    category_id: 2,
    name: "Wood-Fired Margherita",
    description: "San Marzano D.O.P. tomatoes, buffalo mozzarella, fresh sweet basil, extra virgin olive oil.",
    price: 15.0,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    badge: "Classic",
    dietary: "Vegetarian",
  },
  {
    id: 7,
    category_id: 3,
    name: "Tiramisu al Mascarpone",
    description: "Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.",
    price: 9.0,
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    badge: "Chef's Recipe",
    dietary: "Vegetarian",
  },
  {
    id: 8,
    category_id: 3,
    name: "Molten Valrhona Sphere",
    description: "Warm dark chocolate ganache cake, Madagascar bourbon vanilla ice cream, golden lace.",
    price: 10.0,
    image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    badge: "Signature",
    dietary: "Vegetarian",
  },
  {
    id: 9,
    category_id: 4,
    name: "Blood Orange Citrus Spritz",
    description: "Sicilian blood orange, wild garden rosemary, sparkling mineral water, botanical bitters.",
    price: 7.0,
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
    badge: "Zero Proof",
    dietary: "Vegan",
  },
];

export default function Menu() {
  const { add } = useCart();
  const [items, setItems] = useState<any[]>(DEFAULT_ITEMS);
  const [cats, setCats] = useState<any[]>(DEFAULT_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  useEffect(() => {
    (async () => {
      try {
        const a = await supabase.from("categories").select("*").order("id");
        const b = await supabase.from("menu_items").select("*,categories(name)").order("id");
        if (a.data && a.data.length > 0) setCats(a.data);
        if (b.data && b.data.length > 0) setItems(b.data);
      } catch (err) {
        // Fallback default items provide a seamless experience
      }
    })();
  }, []);

  const filtered = items
    .filter((item) => {
      const matchCat = !selectedCat || item.category_id === selectedCat;
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      return 0;
    });

  const handleAdd = (item: any) => {
    add(item);
    toast(`Added "${item.name}" to your order`, "success");
  };

  return (
    <main className="min-h-screen bg-olive text-ivory pt-36 pb-28 px-6 md:px-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gold/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-black/30 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header Title with Botanical Emblem */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            <Sparkles size={13} />
            <span>The Daily Harvest</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-ivory">
            Culinary Collection
          </h1>
          <p className="mt-4 text-sand/80 text-base md:text-lg font-light leading-relaxed">
            Every dish is made strictly to order using fresh ingredients from our trusted organic growers.
          </p>
        </div>

        {/* Toolbar: Category Filter Pills, Search Bar, and Sorter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12 pb-8 border-b border-gold/20">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[{ id: 0, name: "All Dishes" }, ...cats].map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`rounded-full px-5 py-2 text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isSelected
                      ? "bg-gold text-charcoal font-bold shadow-lg shadow-gold/30 scale-105"
                      : "border border-sand/30 text-sand hover:bg-ivory/10 hover:border-gold/50"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search flavours..."
                className="w-full rounded-full border border-sand/40 bg-olive-deep/80 pl-9 pr-4 py-2 text-xs md:text-sm text-ivory outline-none placeholder:text-sand/50 focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-full border border-sand/40 bg-olive-deep/80 px-4 py-2 text-xs md:text-sm text-sand outline-none focus:border-gold cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dishes Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-sand">
            <p className="text-xl font-serif">No dishes match your search criteria.</p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCat(0);
              }}
              className="btn mt-6 !text-xs !py-2.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45 }}
                  className={`group relative overflow-hidden bg-ivory text-charcoal rounded-3xl shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40 flex flex-col justify-between ${
                    idx % 3 === 1 ? "lg:mt-6 border-2 border-gold/40" : ""
                  }`}
                >
                  {/* Image & Badges */}
                  <div>
                    <div className="relative h-60 w-full overflow-hidden">
                      <Img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {item.badge && (
                          <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-olive shadow">
                            <Star size={11} />
                            {item.badge}
                          </span>
                        )}
                        {item.dietary && (
                          <span className="rounded-full bg-olive-deep/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-sand">
                            {item.dietary}
                          </span>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3 rounded-full bg-olive-deep/90 backdrop-blur-md px-3.5 py-1 text-base font-serif font-bold text-gold border border-gold/30">
                        ${Number(item.price).toFixed(2)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/50">
                        {item.categories?.name || "Nimza Kitchen"}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-olive mt-1 group-hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-charcoal/70 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Order Button in Footer */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleAdd(item)}
                      className="btn-d w-full !py-2.5 !text-xs flex items-center justify-center gap-2 group-hover:bg-gold group-hover:text-charcoal transition-all shadow-sm"
                    >
                      <Plus size={15} />
                      <span>Add to Order</span>
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
