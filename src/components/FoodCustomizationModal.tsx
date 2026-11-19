"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Plus,
  Minus,
  Check,
  Sparkles,
  Utensils,
  Leaf,
  Layers,
  ChefHat,
  Info,
} from "lucide-react";
import {
  FoodCustomization,
  PortionOption,
  ToppingOption,
} from "@/components/Cart";

export const DEFAULT_PORTIONS: PortionOption[] = [
  {
    id: "petite",
    label: "Petite Tasting",
    description: "Lighter degustation portion for moderate appetites",
    priceDelta: -2.5,
  },
  {
    id: "regular",
    label: "Chef's Standard",
    description: "Traditional full portion crafted to recipe specifications",
    priceDelta: 0.0,
  },
  {
    id: "grand",
    label: "Grand Feast",
    description: "Generous double portion with extra chef garnish",
    priceDelta: 6.0,
  },
];

export const AVAILABLE_TOPPINGS: ToppingOption[] = [
  { id: "truffle_butter", name: "Umbrian Truffle Butter Infusion", price: 4.0 },
  { id: "parmigiano", name: "Shaved 36-Month Parmigiano-Reggiano", price: 2.5 },
  { id: "garlic_confit", name: "Slow-Roasted Garlic Confit & Herb Oil", price: 1.5 },
  { id: "porcini", name: "Pan-Sautéed Wild Porcini Mushrooms", price: 4.5 },
  { id: "pancetta", name: "Crispy Heritage Pancetta Lardons", price: 3.0 },
  { id: "buffalo_mozz", name: "Fresh Buffalo Mozzarella D.O.P.", price: 3.5 },
];

export const SPICE_LEVELS: Array<{
  level: "Mild" | "Medium" | "Hot";
  icon: string;
  desc: string;
  color: string;
}> = [
  {
    level: "Mild",
    icon: "🌿",
    desc: "Aromatic & subtle, no added chili heat",
    color: "border-emerald-300 text-emerald-800 bg-emerald-50/70",
  },
  {
    level: "Medium",
    icon: "🌶️",
    desc: "Balanced warmth with Calabrian pepper & peppercorn",
    color: "border-amber-300 text-amber-800 bg-amber-50/70",
  },
  {
    level: "Hot",
    icon: "🔥",
    desc: "Fiery Tuscan peperoncino & cracked chili seeds",
    color: "border-rose-400 text-rose-800 bg-rose-50/70",
  },
];

interface FoodCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: any;
  initialCustomization?: FoodCustomization;
  initialQty?: number;
  mode?: "add" | "edit";
  onSave: (customization: FoodCustomization, quantity: number) => void;
}

export default function FoodCustomizationModal({
  isOpen,
  onClose,
  dish,
  initialCustomization,
  initialQty = 1,
  mode = "add",
  onSave,
}: FoodCustomizationModalProps) {
  const [selectedPortion, setSelectedPortion] = useState<PortionOption>(
    initialCustomization?.portion || DEFAULT_PORTIONS[1]
  );
  const [selectedSpice, setSelectedSpice] = useState<"Mild" | "Medium" | "Hot">(
    initialCustomization?.spiceLevel || "Mild"
  );
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>(
    initialCustomization?.toppings || []
  );
  const [instructions, setInstructions] = useState<string>(
    initialCustomization?.specialInstructions || ""
  );
  const [quantity, setQuantity] = useState<number>(initialQty);

  // Re-sync when dish or initialCustomization changes
  useEffect(() => {
    if (initialCustomization) {
      setSelectedPortion(initialCustomization.portion || DEFAULT_PORTIONS[1]);
      setSelectedSpice(initialCustomization.spiceLevel || "Mild");
      setSelectedToppings(initialCustomization.toppings || []);
      setInstructions(initialCustomization.specialInstructions || "");
    } else {
      setSelectedPortion(DEFAULT_PORTIONS[1]);
      setSelectedSpice("Mild");
      setSelectedToppings([]);
      setInstructions("");
    }
    setQuantity(initialQty > 0 ? initialQty : 1);
  }, [dish, initialCustomization, initialQty]);

  if (!isOpen || !dish) return null;

  const basePrice = Number(dish.basePrice || dish.price || 0);
  const portionDelta = selectedPortion.priceDelta;
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = Math.max(0, basePrice + portionDelta + toppingsTotal);
  const finalPrice = unitPrice * quantity;

  const toggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleConfirm = () => {
    const customizationData: FoodCustomization = {
      portion: selectedPortion,
      spiceLevel: selectedSpice,
      toppings: selectedToppings,
      specialInstructions: instructions.trim(),
    };
    onSave(customizationData, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="relative w-full max-w-2xl rounded-[2.5rem] bg-white border border-sand shadow-2xl text-charcoal overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header with Dish Photography Preview */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#1F241F] to-[#2B332B] text-ivory border-b border-gold/30 shrink-0">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-sand hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 pr-10">
              {dish.image_url && (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 border border-gold/50 shadow-md">
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold mb-1">
                  <Sparkles size={11} />
                  <span>{mode === "edit" ? "Edit Customization" : "Crafted to Your Taste"}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory tracking-tight">
                  {dish.name}
                </h3>
                <p className="text-xs text-sand/80 mt-1 line-clamp-1 font-light">
                  {dish.description || "Freshly cooked to order with seasonal ingredients"}
                </p>
                <div className="mt-2 text-sm font-serif font-bold text-gold">
                  Base Price: ${basePrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Customization Options Form */}
          <div className="p-6 sm:p-8 space-y-7 overflow-y-auto flex-1">
            {/* 1. PORTION SIZE SELECTION */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                  <Layers size={14} className="text-gold" />
                  <span>1. Select Portion Size</span>
                </label>
                <span className="text-[11px] text-charcoal/50">Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEFAULT_PORTIONS.map((portion) => {
                  const isSelected = selectedPortion.id === portion.id;
                  const deltaSign = portion.priceDelta > 0 ? "+" : portion.priceDelta < 0 ? "-" : "";
                  const deltaDisplay =
                    portion.priceDelta !== 0
                      ? `${deltaSign}$${Math.abs(portion.priceDelta).toFixed(2)}`
                      : "Included";

                  return (
                    <button
                      type="button"
                      key={portion.id}
                      onClick={() => setSelectedPortion(portion)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-gold/15 border-gold shadow-sm ring-1 ring-gold/40"
                          : "bg-[#FAF9F5] border-sand hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-sm text-olive">
                          {portion.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            portion.priceDelta > 0
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : portion.priceDelta < 0
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-sand/40 text-charcoal/70"
                          }`}
                        >
                          {deltaDisplay}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/60 leading-relaxed font-light mt-1">
                        {portion.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SPICE-LEVEL OPTIONS: Mild, Medium, Hot */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                  <Flame size={14} className="text-gold" />
                  <span>2. Kitchen Spice Level</span>
                </label>
                <span className="text-[11px] text-charcoal/50">Choose heat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SPICE_LEVELS.map(({ level, icon, desc, color }) => {
                  const isSelected = selectedSpice === level;
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setSelectedSpice(level)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? `${color} ring-2 ring-gold/50 shadow-xs font-bold`
                          : "bg-[#FAF9F5] border-sand hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-serif font-bold text-sm text-olive">
                          {level} Heat
                        </span>
                        {isSelected && (
                          <span className="ml-auto w-4 h-4 rounded-full bg-gold text-[#1F241F] grid place-items-center">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-charcoal/60 leading-relaxed font-light mt-1.5">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. ADDITIONAL TOPPINGS & INGREDIENTS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                  <Leaf size={14} className="text-gold" />
                  <span>3. Additional Toppings & Luxury Add-ons</span>
                </label>
                <span className="text-[11px] text-charcoal/50">Optional selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_TOPPINGS.map((topping) => {
                  const isChecked = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <label
                      key={topping.id}
                      onClick={() => toggleTopping(topping)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-gold/15 border-gold shadow-2xs"
                          : "bg-[#FAF9F5] border-sand hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-gold border-gold text-[#1F241F]"
                              : "border-sand bg-white"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-medium text-charcoal">
                          {topping.name}
                        </span>
                      </div>
                      <span className="text-xs font-serif font-bold text-olive shrink-0 ml-2">
                        +${topping.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. SPECIAL INSTRUCTIONS / ALLERGIES */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-1.5">
                4. Chef Notes & Dietary Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Sauce served on the side, omit fresh garlic, extra crispy crust..."
                className="w-full rounded-2xl bg-[#FAF9F5] border border-sand px-4 py-2.5 text-xs text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
              />
            </div>
          </div>

          {/* Footer Bar with Live Price Breakdown & Confirmation */}
          <div className="p-5 sm:p-6 bg-[#FAF9F5] border-t border-sand shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Live Calculation Display */}
            <div>
              <div className="text-[11px] text-charcoal/60 flex items-center gap-1.5">
                <span>Base: ${basePrice.toFixed(2)}</span>
                {portionDelta !== 0 && (
                  <span>
                    • Portion: {portionDelta > 0 ? "+" : ""}${portionDelta.toFixed(2)}
                  </span>
                )}
                {toppingsTotal > 0 && (
                  <span>• Extras: +${toppingsTotal.toFixed(2)}</span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Total Dish Price:
                </span>
                <span className="font-serif text-2xl font-bold text-olive">
                  ${finalPrice.toFixed(2)}
                </span>
                <span className="text-xs text-charcoal/50">
                  (${unitPrice.toFixed(2)} each)
                </span>
              </div>
            </div>

            {/* Quantity Stepper & Submit Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-sand shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-7 w-7 place-items-center rounded-full bg-sand/30 hover:bg-gold hover:text-charcoal transition-colors text-charcoal"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center font-bold text-sm text-charcoal">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-sand/30 hover:bg-gold hover:text-charcoal transition-colors text-charcoal"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-gold-light hover:scale-105 active:scale-95 transition-all shadow-md shadow-gold/25"
              >
                <Check size={15} />
                <span>
                  {mode === "edit"
                    ? `Update Selection — $${finalPrice.toFixed(2)}`
                    : `Add to Cart — $${finalPrice.toFixed(2)}`}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
