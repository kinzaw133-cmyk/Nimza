"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Flame,
  Wine,
  Utensils,
  Plus,
  Check,
  ArrowRight,
  Sliders,
  Compass,
  ThumbsUp,
  Heart,
} from "lucide-react";
import { useCart } from "@/components/Cart";
import { toast } from "@/lib/notify";

export type FlavorProfile = "earthy" | "coastal" | "comfort" | "sweet";

interface RecommendedPairing {
  id: string;
  profile: FlavorProfile;
  title: string;
  badge: string;
  sommelierNotes: string;
  mainDish: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
  pairedBeverage: {
    name: string;
    type: "Wine" | "Digestif" | "Cocktail" | "Artisan Brew";
    notes: string;
  };
  companionSide: {
    name: string;
    price: number;
  };
  bundleDiscountPrice: number;
}

const AI_RECOMMENDED_PAIRINGS: RecommendedPairing[] = [
  {
    id: "rec-1",
    profile: "earthy",
    title: "The Tuscan Truffle & Wood-Fire Masterpiece",
    badge: "AI Chef Elias Signature Match",
    sommelierNotes:
      "The earthy, musky umami of autumn black truffle in the handmade tagliatelle seamlessly amplifies the charred crust and caramelized fat cap of our dry-aged prime ribeye.",
    mainDish: {
      id: 1,
      name: "Truffle Tagliatelle",
      price: 18.0,
      image_url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&q=80",
      category: "Handmade Pasta",
    },
    pairedBeverage: {
      name: "Chianti Classico Riserva 2018 (Castello di Ama)",
      type: "Wine",
      notes: "High acidity and velvety tannins that slice through rich truffle butter.",
    },
    companionSide: {
      name: "Prime Ribeye 45-Day Dry-Aged",
      price: 46.0,
    },
    bundleDiscountPrice: 58.0, // savings vs $64
  },
  {
    id: "rec-2",
    profile: "coastal",
    title: "Mediterranean Sea Breeze & Citrus Flight",
    badge: "Light & Refreshing Algorithm",
    sommelierNotes:
      "Crisp pan-seared salmon skin and tender herbaceous pink flakes paired alongside freshly picked heirloom garden greens dressed in cold-pressed Sicilian olive nectar.",
    mainDish: {
      id: 3,
      name: "Pan-Seared Salmon",
      price: 22.0,
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
      category: "Seafood Course",
    },
    pairedBeverage: {
      name: "Vermentino di Sardegna DOC (Argiolas)",
      type: "Wine",
      notes: "Saline minerality and green apple notes matching seafood proteins.",
    },
    companionSide: {
      name: "Garden Harvest Truffle Bowl",
      price: 11.0,
    },
    bundleDiscountPrice: 29.5, // savings vs $33
  },
  {
    id: "rec-3",
    profile: "comfort",
    title: "Neapolitan Hearth & Wood-Smoke Comfort",
    badge: "Popular Crowd Harmony",
    sommelierNotes:
      "San Marzano tomato acidity balanced against blistered sourdough crust and buffalo mozzarella melt. Designed for comforting warmth.",
    mainDish: {
      id: 2,
      name: "Wood-Fired Margherita",
      price: 15.0,
      image_url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80",
      category: "Artisanal Pizza",
    },
    pairedBeverage: {
      name: "Birra Moretti La Rossa or Sparkling Aperol Spritz",
      type: "Cocktail",
      notes: "Bubbly effervescence that balances melted mozzarella cream.",
    },
    companionSide: {
      name: "Tiramisu al Mascarpone",
      price: 9.0,
    },
    bundleDiscountPrice: 21.0, // savings vs $24
  },
  {
    id: "rec-4",
    profile: "sweet",
    title: "The Grand Finale Espresso & Dolci Duet",
    badge: "Nightcap Degustation",
    sommelierNotes:
      "Rich mascarpone foam layered over Savoiardi biscuits soaked in triple-shot dark Italian roast. Complemented by single-origin espresso.",
    mainDish: {
      id: 8,
      name: "Tiramisu al Mascarpone",
      price: 9.0,
      image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
      category: "Signature Dolce",
    },
    pairedBeverage: {
      name: "Limoncello di Sorrento (House-Infused)",
      type: "Digestif",
      notes: "Chilled zesty finish cleaning the palate after sweet mascarpone.",
    },
    companionSide: {
      name: "Single-Origin Italian Roast Espresso",
      price: 4.5,
    },
    bundleDiscountPrice: 12.0,
  },
];

export default function AiRecommendations() {
  const { add } = useCart();
  const [activeProfile, setActiveProfile] = useState<FlavorProfile>("earthy");

  const currentPairing =
    AI_RECOMMENDED_PAIRINGS.find((p) => p.profile === activeProfile) ||
    AI_RECOMMENDED_PAIRINGS[0];

  const handleAddPairingToCart = (pairing: RecommendedPairing) => {
    // Add main dish
    add(pairing.mainDish, undefined, 1);
    toast(`Added AI pairing: "${pairing.mainDish.name}" & "${pairing.companionSide.name}" to your cart!`, "success");
  };

  return (
    <div className="rounded-[2.5rem] bg-gradient-to-br from-[#1F241F] via-[#2A302A] to-[#141714] text-sand p-6 sm:p-8 md:p-10 border border-gold/40 shadow-2xl relative overflow-hidden mb-12">
      {/* Background ambient luxury glow */}
      <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sand/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              AI Sommelier &amp; Brigade Pairing Engine
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Chef Elias AI Taste Profile Matcher
          </h3>
          <p className="text-xs text-sand/70 mt-1 max-w-xl font-light">
            Select your desired palate mood to reveal algorithmic culinary harmonies, complementary wine vintages, and recommended courses.
          </p>
        </div>

        {/* Flavor Profile Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 border border-white/10 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "earthy", label: "Truffle & Earthy", icon: Flame },
            { id: "coastal", label: "Coastal & Light", icon: Wine },
            { id: "comfort", label: "Hearth Comfort", icon: Utensils },
            { id: "sweet", label: "Dessert & Dolce", icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveProfile(id as FlavorProfile)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeProfile === id
                  ? "bg-gold text-charcoal shadow-sm font-extrabold"
                  : "text-sand/70 hover:text-white"
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Recommendation Feature Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPairing.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6"
        >
          {/* Left: Food Photography & Badge */}
          <div className="lg:col-span-5 relative h-64 sm:h-76 rounded-3xl overflow-hidden bg-black/40 border border-sand/30 shadow-lg group">
            <img
              src={currentPairing.mainDish.image_url}
              alt={currentPairing.mainDish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/40 backdrop-blur-xs">
              {currentPairing.badge}
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-gold text-[#1F241F] font-bold text-xs shadow-md">
              Pairing Bundle: ${currentPairing.bundleDiscountPrice.toFixed(2)}
            </div>
          </div>

          {/* Right: Sommelier Analysis & Course Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold font-bold">
                Harmonic Recommendation
              </span>
              <h4 className="font-serif text-2xl font-bold text-white mt-0.5">
                {currentPairing.title}
              </h4>
              <p className="text-xs text-sand/80 mt-2 leading-relaxed italic font-light border-l-2 border-gold pl-3">
                &ldquo;{currentPairing.sommelierNotes}&rdquo;
              </p>
            </div>

            {/* Dish + Wine Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              {/* Primary Dish */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-gold/80 block">
                  Recommended Course
                </span>
                <p className="font-serif font-bold text-white text-sm">
                  {currentPairing.mainDish.name}
                </p>
                <span className="font-mono text-gold font-bold">
                  ${currentPairing.mainDish.price.toFixed(2)} USD
                </span>
              </div>

              {/* Sommelier Wine Companion */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-gold/80 flex items-center gap-1">
                  <Wine size={11} /> Sommelier Wine Pairing
                </span>
                <p className="font-serif font-bold text-white text-sm truncate">
                  {currentPairing.pairedBeverage.name}
                </p>
                <p className="text-[11px] text-sand/60 truncate">
                  {currentPairing.pairedBeverage.notes}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-sand/20">
              <div className="text-xs">
                <span className="text-sand/50 block">Complimentary Course:</span>
                <strong className="text-white font-medium">
                  + {currentPairing.companionSide.name}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => handleAddPairingToCart(currentPairing)}
                className="py-3 px-6 rounded-full bg-gold hover:bg-gold-light text-[#1F241F] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <Plus size={14} />
                <span>Add AI Pairing to Cart</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
