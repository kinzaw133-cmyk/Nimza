"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, Check, Download, Eye } from "lucide-react";
import NimzaLogo, { LogoVariant, BotanicalLeafSvg } from "./NimzaLogo";

interface VariantDetail {
  id: LogoVariant;
  name: string;
  tagline: string;
  desc: string;
  bestFor: string;
  previewBg: string;
}

const VARIANTS: VariantDetail[] = [
  {
    id: "header",
    name: "The Grand Monogram",
    tagline: "Serif 'N' with Golden Botanical Laurel",
    desc: "The primary brand mark featuring a high-contrast Roman serif 'N' intertwined with a hand-rendered antique gold olive branch.",
    bestFor: "Navigation headers, menus, luxury invitations, storefront facade",
    previewBg: "bg-ivory",
  },
  {
    id: "circle",
    name: "The Royal Gastronomy Seal",
    tagline: "Circular Double Ring with Cutlery Crest",
    desc: "Emblematic circular stamp embracing artisan fork & spoon utensils with a flourishing botanical wreath, symbolizing warm culinary craft.",
    bestFor: "Wax stamps, wine labels, reservation confirmation seals, chef certificates",
    previewBg: "bg-olive-deep",
  },
  {
    id: "pebble",
    name: "The Organic Pebble Badge",
    tagline: "Deep Olive Silhouette with Ivory Script",
    desc: "An organic pebble-shaped badge capturing the earthiness of olive groves with a warm ribbon flourish and botanical branch.",
    bestFor: "Footer signature, packaging bags, coaster emblems, staff aprons",
    previewBg: "bg-sand-light",
  },
  {
    id: "badge",
    name: "The Triple-Star Emblem",
    tagline: "Fine Dining & Lounge Heraldry",
    desc: "Curated luxury shield highlighting culinary excellence, three gold stars, and pristine balanced typography.",
    bestFor: "VIP membership cards, awards showcase, private dining suites",
    previewBg: "bg-olive-muted",
  },
  {
    id: "monogram",
    name: "Pure Monogram Stamp",
    tagline: "Iconic 'N' Botanical Mark",
    desc: "The distilled essence of Nimza: a bold sculpted capital letter crowned with the golden sprig of patience and nature.",
    bestFor: "Favicons, mobile app icons, napkin embossing, watermarks",
    previewBg: "bg-ivory-soft",
  },
];

const COLORS = [
  { name: "Deep Olive", hex: "#343D27", role: "Primary Canvas & Earthiness" },
  { name: "Antique Gold", hex: "#B99A5B", role: "Botanical Leaves & Accents" },
  { name: "Warm Ivory", hex: "#F7F4EC", role: "Editorial Backgrounds & Plates" },
  { name: "Warm Sand", hex: "#E9DFC9", role: "Card Textures & Subtlety" },
  { name: "Charcoal Noir", hex: "#24241F", role: "Luxury Typography & Contrast" },
];

export default function LogoShowcase() {
  const [selected, setSelected] = useState<LogoVariant>("header");
  const [bgMode, setBgMode] = useState<"ivory" | "olive" | "charcoal">("ivory");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const active = VARIANTS.find((v) => v.id === selected) || VARIANTS[0];

  const copyHex = (hex: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  return (
    <section className="relative overflow-hidden bg-ivory-warm py-24 px-6 md:px-12 border-y border-gold/20">
      {/* Ambient background decoration */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-olive/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Sparkles size={13} className="text-gold" /> Brand Heritage & Identity
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-olive font-bold">
            The Signatures of Nimza
          </h2>
          <p className="mt-4 text-charcoal/80 text-base leading-relaxed">
            Every element of our visual identity is born from the harmony of earthy deep olive, radiant antique gold, and warm natural textures.
          </p>
        </div>

        {/* Main Grid: Interactive Stage on Left, Variant Selectors on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive Logo Stage */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[2.5rem] p-8 md:p-12 border border-gold/30 shadow-xl transition-all duration-500 relative overflow-hidden"
            style={{
              backgroundColor: bgMode === "olive" ? "#27301B" : bgMode === "charcoal" ? "#1A1A17" : "#F7F4EC",
              color: bgMode === "ivory" ? "#24241F" : "#F7F4EC"
            }}
          >
            {/* Top Toolbar: Switch background mode */}
            <div className="flex items-center justify-between mb-8 z-10">
              <span className="text-xs uppercase tracking-widest font-medium opacity-70">
                Interactive Canvas Preview
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-full border border-gold/30 bg-black/10 backdrop-blur-sm">
                <button
                  onClick={() => setBgMode("ivory")}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    bgMode === "ivory" ? "bg-white text-olive font-bold shadow-sm" : "text-sand opacity-70 hover:opacity-100"
                  }`}
                >
                  Ivory
                </button>
                <button
                  onClick={() => setBgMode("olive")}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    bgMode === "olive" ? "bg-gold text-olive font-bold shadow-sm" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  Olive
                </button>
                <button
                  onClick={() => setBgMode("charcoal")}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    bgMode === "charcoal" ? "bg-charcoal text-ivory font-bold shadow-sm" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  Noir
                </button>
              </div>
            </div>

            {/* Central Logo Display with Fluid Animation */}
            <div className="my-10 flex flex-col items-center justify-center min-h-[260px] text-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selected}-${bgMode}`}
                  initial={{ opacity: 0, scale: 0.88, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="p-6 rounded-3xl transition-transform duration-500 hover:scale-105">
                    <NimzaLogo variant={selected} size="xl" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Meta Bar */}
            <div className="pt-6 border-t border-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
              <div>
                <h3 className="font-serif text-2xl font-bold">{active.name}</h3>
                <p className="text-xs tracking-wider opacity-75 uppercase mt-0.5">{active.tagline}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gold bg-gold/10 px-3 py-1.5 rounded-full border border-gold/30">
                <Eye size={14} /> Active Brand Variant
              </div>
            </div>
          </div>

          {/* Right Column: Variant Selector Cards & Color Palette */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-charcoal/60 px-1">
                Select Brand Variant
              </p>
              {VARIANTS.map((v) => {
                const isSelected = selected === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isSelected
                        ? "bg-white border-gold shadow-md shadow-gold/10 ring-1 ring-gold"
                        : "bg-white/60 border-sand hover:bg-white hover:border-gold/50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 w-12 h-12 rounded-xl bg-ivory flex items-center justify-center border border-sand/80 overflow-hidden">
                      <NimzaLogo variant={v.id} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-bold text-olive">{v.name}</h4>
                        {isSelected && <span className="text-gold text-sm font-bold">✓</span>}
                      </div>
                      <p className="text-xs text-charcoal/70 line-clamp-1 mt-0.5">{v.tagline}</p>
                      <p className="text-[11px] text-gold-dark mt-1 font-medium">Ideal for: {v.bestFor}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Swatches Grid */}
            <div className="bg-white/80 p-5 rounded-2xl border border-sand">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-charcoal/70">
                  Brand Color Palette
                </span>
                {copiedColor && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check size={12} /> Copied {copiedColor}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => copyHex(c.hex)}
                    className="group flex flex-col items-center text-center focus:outline-none"
                    title={`Click to copy: ${c.name} (${c.hex})`}
                  >
                    <div
                      className="w-full aspect-square rounded-xl shadow-sm border border-black/10 transition-transform group-hover:scale-110 group-active:scale-95"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] font-bold text-charcoal/80 mt-1 truncate w-full">
                      {c.name}
                    </span>
                    <span className="text-[9px] text-charcoal/50 font-mono">
                      {c.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
