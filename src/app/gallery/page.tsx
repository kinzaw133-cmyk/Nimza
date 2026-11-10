"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Maximize2, Camera } from "lucide-react";
import Img from "@/components/Img";

interface GalleryPhoto {
  id: string;
  category: "ambiance" | "culinary" | "cellar" | "events";
  title: string;
  caption: string;
  url: string;
}

const PHOTOS: GalleryPhoto[] = [
  {
    id: "1",
    category: "ambiance",
    title: "The Main Dining Hall",
    caption: "High vaulted ceilings, linen drapery, and intimate candlelight.",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85",
  },
  {
    id: "2",
    category: "ambiance",
    title: "Cocktail Bar & Lounge",
    caption: "Hand-carved walnut bar with bespoke botanical cocktails.",
    url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=85",
  },
  {
    id: "3",
    category: "culinary",
    title: "Truffle Tagliatelle",
    caption: "Hand-rolled daily and crowned with Umbrian black truffle shavings.",
    url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=85",
  },
  {
    id: "4",
    category: "culinary",
    title: "Dry-Aged Prime Ribeye",
    caption: "Finished over cherrywood embers with roasted garlic butter.",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=85",
  },
  {
    id: "5",
    category: "culinary",
    title: "Valrhona Chocolate Sphere",
    caption: "Dark chocolate, bourbon vanilla cream, and gold dust crisp.",
    url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200&q=85",
  },
  {
    id: "6",
    category: "cellar",
    title: "The Private Sommelier Cellar",
    caption: "Over 120 curated vintages preserved under strict climate regulation.",
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=85",
  },
  {
    id: "7",
    category: "ambiance",
    title: "Garden Courtyard Veranda",
    caption: "Open-air dining under ancient olive trees and string fairy lights.",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=85",
  },
  {
    id: "8",
    category: "events",
    title: "Private Banquet Table",
    caption: "Bespoke fine dining arrangements for milestone celebrations and galas.",
    url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=85",
  },
  {
    id: "9",
    category: "culinary",
    title: "Citrus Spritz & Infusions",
    caption: "Wild herbs, freshly harvested citrus, and effervescent bubbles.",
    url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&q=85",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Imagery" },
  { id: "ambiance", label: "Dining Hall & Lounge" },
  { id: "culinary", label: "Culinary Art" },
  { id: "cellar", label: "Wine Cellar" },
  { id: "events", label: "Private Banquets" },
];

export default function Gallery() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const filtered = selectedCat === "all"
    ? PHOTOS
    : PHOTOS.filter((p) => p.category === selectedCat);

  return (
    <main className="min-h-screen bg-ivory text-charcoal pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-sand/40 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive mb-3">
            <Camera size={13} className="text-gold" /> Visual Journey
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-olive tracking-tight">
            The Gallery
          </h1>
          <p className="mt-4 text-charcoal/80 text-base md:text-lg font-light leading-relaxed">
            Glimpse into the warmth, flame, and meticulous craft that defines every evening at Nimza.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`rounded-full px-5 py-2 text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 ${
                  isSelected
                    ? "bg-olive text-gold font-bold shadow-md shadow-olive/30 scale-105"
                    : "border border-sand bg-white text-charcoal/70 hover:border-gold/50 hover:text-olive"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Masonry / Grid */}
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filtered.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative overflow-hidden rounded-3xl bg-olive-deep shadow-md border border-gold/20 cursor-pointer break-inside-avoid"
                onClick={() => setActivePhoto(photo)}
              >
                <Img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-ivory">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    {photo.category}
                  </span>
                  <h3 className="font-serif text-2xl font-bold mt-1 text-ivory">{photo.title}</h3>
                  <p className="text-xs text-sand/80 mt-1 line-clamp-2">{photo.caption}</p>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gold font-medium">
                    <Maximize2 size={13} /> Click to expand
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-4xl w-full bg-olive-deep rounded-3xl overflow-hidden border border-gold/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhoto(null)}
                aria-label="Close Preview"
                className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-ivory hover:bg-gold hover:text-charcoal transition-all"
              >
                <X size={20} />
              </button>

              <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  className="w-full h-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="p-6 text-ivory flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-olive-muted">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
                    {activePhoto.category}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ivory mt-0.5">{activePhoto.title}</h3>
                  <p className="text-xs text-sand/80 mt-1">{activePhoto.caption}</p>
                </div>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="btn-d !py-2 !px-5 text-xs shrink-0"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
