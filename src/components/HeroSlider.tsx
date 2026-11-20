"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CalendarCheck,
  Tag,
  Sparkles,
  X,
  Check,
  Volume2,
} from "lucide-react";
import { useCart } from "./Cart";
import { toast } from "@/lib/notify";
import { preloadImages } from "@/lib/imageCache";

interface SlideData {
  id: string;
  cartId: number;
  title: string;
  kicker: string;
  themeColor: string;
  themeColorLight: string;
  bgGlow: string;
  description: string;
  mediumPrice: number;
  largePrice: number;
  plateImg: string;
  coupon: {
    title: string;
    portion: string;
    price: number;
    thumb: string;
    code: string;
    discount: string;
  };
  lookbook: {
    videoUrl?: string;
    pairing: string;
    technique: string;
    notes: string;
  };
}

const SLIDES: SlideData[] = [
  {
    id: "steak-tomato",
    cartId: 101,
    title: "steak with tomato",
    kicker: "DESIGN BY NIMZA ATELIER",
    themeColor: "#C8322B",
    themeColorLight: "#FF5252",
    bgGlow: "rgba(200, 50, 43, 0.08)",
    description:
      "Salisbury Steak is made with ground prime beef that has been shaped into tender medallions, while Swiss Steak is made with actual steak. For Swiss Steak, the beef is rolled or pounded and then braised in a rich roasted cherry tomato confit.",
    mediumPrice: 34.0,
    largePrice: 46.0,
    plateImg:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=85",
    coupon: {
      title: "FISH SALAD",
      portion: "MEDIUM",
      price: 7.5,
      thumb:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=80",
      code: "TOMATO15",
      discount: "15% OFF",
    },
    lookbook: {
      pairing: "2018 Barolo Riserva DOCG or Tuscan Sangiovese",
      technique: "48-Hour Heritage Dry-Age & Wood-Fired Cast Iron Sear",
      notes:
        "Hand-selected bone-in beef medallion seared over flaming oak embers. Served with blistered sweet cherry tomatoes on the vine, golden shoestring potato crisps, and rosemary bone marrow reduction.",
    },
  },
  {
    id: "salmon-salad",
    cartId: 102,
    title: "salmon salad",
    kicker: "DESIGN BY NIMZA ATELIER",
    themeColor: "#2E7D32",
    themeColorLight: "#4CAF50",
    bgGlow: "rgba(46, 125, 50, 0.08)",
    description:
      "Delicate ribbons of wild Norwegian salmon cured with sea salt and pink peppercorns, arranged over butterhead lettuce, fresh lime wheels, capers, and a finishing drizzle of cold-pressed virgin olive oil.",
    mediumPrice: 26.0,
    largePrice: 35.0,
    plateImg:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1000&auto=format&fit=crop&q=85",
    coupon: {
      title: "HERB SALMON",
      portion: "MEDIUM",
      price: 8.5,
      thumb:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&auto=format&fit=crop&q=80",
      code: "SALMON20",
      discount: "20% OFF",
    },
    lookbook: {
      pairing: "Chablis Premier Cru or Crisp Provence Rosé",
      technique: "Citrus-Brined Carpaccio & 12-Hour Cold Herb Cure",
      notes:
        "Sashimi-grade salmon thinly sliced into rosettes, tossed with organic butterhead lettuce leaves, freshly sliced Persian lime wheels, caper berries, and finishing cold-pressed Sicilian olive oil.",
    },
  },
  {
    id: "chicken-salad",
    cartId: 103,
    title: "chicken salad",
    kicker: "DESIGN BY NIMZA ATELIER",
    themeColor: "#E59819",
    themeColorLight: "#FFA726",
    bgGlow: "rgba(229, 152, 25, 0.08)",
    description:
      "Wood-fire roasted chicken breast shredded and tossed with seasonal organic greens, julienned heirloom carrots, toasted sesame seeds, garden peas, and a light honey-dijon vinaigrette.",
    mediumPrice: 22.0,
    largePrice: 30.0,
    plateImg:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=85",
    coupon: {
      title: "CHICKEN BOWL",
      portion: "MEDIUM",
      price: 6.9,
      thumb:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80",
      code: "CHICKEN15",
      discount: "15% OFF",
    },
    lookbook: {
      pairing: "Single-Vineyard Sauvignon Blanc or Botanical Tonic",
      technique: "Slow Charcoal Roast & Herb-Infused Shredding",
      notes:
        "Free-range corn-fed chicken breast roasted slowly over charcoal embers, shredded tender with crispy garden harvest leaves, shaved carrots, sweet garden peas, and warm toasted sesame vinaigrette.",
    },
  },
  {
    id: "steak-potato",
    cartId: 104,
    title: "steak with potato",
    kicker: "DESIGN BY NIMZA ATELIER",
    themeColor: "#D32F2F",
    themeColorLight: "#FF5252",
    bgGlow: "rgba(211, 47, 47, 0.08)",
    description:
      "300g Prime heritage dry-aged ribeye seared over smoking oak coals, served alongside golden roasted rosemary potato wedges, whipped confit garlic butter, and fresh wild arugula.",
    mediumPrice: 38.0,
    largePrice: 52.0,
    plateImg:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1000&auto=format&fit=crop&q=85",
    coupon: {
      title: "ROAST POTATOES",
      portion: "LARGE",
      price: 7.0,
      thumb:
        "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=300&auto=format&fit=crop&q=80",
      code: "STEAK20",
      discount: "20% OFF",
    },
    lookbook: {
      pairing: "Bordeaux Grand Cru Classé or Vintage Syrah",
      technique: "Live Wood-Fire Embers & Herb Basting",
      notes:
        "Caramelized exterior with tender juicy rose center. Accompanied by triple-cooked rosemary potato wedges and fresh peppery arugula dressed with aged balsamic glaze.",
    },
  },
];

export default function HeroSlider() {
  const { add } = useCart();
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState<"medium" | "large">("medium");
  const [isPaused, setIsPaused] = useState(false);
  const [lookbookOpen, setLookbookOpen] = useState(false);
  const [claimedCodes, setClaimedCodes] = useState<Record<string, boolean>>({});

  const current = SLIDES[index];
  const activePrice = size === "medium" ? current.mediumPrice : current.largePrice;

  // Preload all hero slide imagery into memory/cache on initial mount
  useEffect(() => {
    const urls = SLIDES.flatMap((s) => [s.plateImg, s.coupon?.thumb].filter(Boolean) as string[]);
    preloadImages(urls, 1000);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || lookbookOpen) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
      setSize("medium"); // Reset size for new slide
    }, 5000);
    return () => clearInterval(timer);
  }, [index, isPaused, lookbookOpen]);

  const changeSlide = (delta: number) => {
    setIndex((prev) => (prev + delta + SLIDES.length) % SLIDES.length);
    setSize("medium");
  };

  const playChime = (freq = 587.33) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const handleAddToCart = () => {
    add({
      id: current.cartId + (size === "large" ? 1000 : 0),
      name: `${current.title.toUpperCase()} (${size === "medium" ? "Medium" : "Large"})`,
      price: activePrice,
      image_url: current.plateImg,
      description: current.description,
      category: "Hero Signature",
    });
    playChime(660);
    toast(`Added "${current.title}" (${size}) to Cart — $${activePrice.toFixed(2)}`, "success");
  };

  const handleClaimCoupon = (code: string, discount: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {}
    setClaimedCodes((prev) => ({ ...prev, [code]: true }));
    playChime(880);
    toast(`🎉 Voucher "${code}" Claimed (${discount})! Copied to clipboard.`, "success");
  };

  return (
    <section
      id="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[92vh] lg:min-h-screen overflow-hidden bg-[#FAFAF8] text-charcoal flex items-center pt-28 pb-20 md:pt-36 md:pb-28 lg:py-32 transition-colors duration-700"
    >
      {/* Dynamic ambient radial backdrop glow matching current slide theme */}
      <div
        className="pointer-events-none absolute -top-40 right-10 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1000 opacity-60"
        style={{
          background: `radial-gradient(circle, ${current.themeColor} 0%, transparent 70%)`,
          opacity: 0.12,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${current.themeColor} 0%, transparent 75%)`,
          opacity: 0.06,
        }}
      />

      {/* Subtle Luxury Linen Texture Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#24241F_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: KICKER, TITLE, DESCRIPTION, SIZE, ACTIONS   */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 md:space-y-7 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {/* Brand Kicker / Subtitle */}
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-charcoal/50">
                  {current.kicker}
                </p>

                {/* Main Heading (All lowercase, matching reference design) */}
                <h1
                  className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] capitalize md:lowercase"
                  style={{ color: current.themeColor }}
                >
                  {current.title}
                </h1>

                {/* Description Paragraph */}
                <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-charcoal/70 max-w-xl font-normal">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Size Radio Selector: Medium / Large */}
            <div className="pt-2 flex items-center gap-6">
              <label
                onClick={() => setSize("medium")}
                className="group flex items-center gap-2 cursor-pointer select-none"
              >
                <div
                  className={`grid h-4 w-4 place-items-center rounded-full border transition-all ${
                    size === "medium"
                      ? "border-2"
                      : "border-charcoal/40 group-hover:border-charcoal"
                  }`}
                  style={{
                    borderColor: size === "medium" ? current.themeColor : undefined,
                  }}
                >
                  {size === "medium" && (
                    <motion.div
                      layoutId="activeRadioDot"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: current.themeColor }}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    size === "medium" ? "font-bold text-charcoal" : "text-charcoal/60"
                  }`}
                >
                  medium
                </span>
              </label>

              <label
                onClick={() => setSize("large")}
                className="group flex items-center gap-2 cursor-pointer select-none"
              >
                <div
                  className={`grid h-4 w-4 place-items-center rounded-full border transition-all ${
                    size === "large"
                      ? "border-2"
                      : "border-charcoal/40 group-hover:border-charcoal"
                  }`}
                  style={{
                    borderColor: size === "large" ? current.themeColor : undefined,
                  }}
                >
                  {size === "large" && (
                    <motion.div
                      layoutId="activeRadioDot"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: current.themeColor }}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    size === "large" ? "font-bold text-charcoal" : "text-charcoal/60"
                  }`}
                >
                  large
                </span>
              </label>

              {/* Dynamic Live Price Tag */}
              <span className="ml-auto font-serif text-lg font-bold text-charcoal">
                ${activePrice.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons Row: Add to Cart + Book a Table */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={handleAddToCart}
                style={{ backgroundColor: current.themeColor }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ShoppingBag size={14} />
                <span>Add To Cart</span>
              </button>

              <Link
                href="/reservations"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F241F] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black hover:scale-105 active:scale-95 shadow-md transition-all duration-300"
              >
                <CalendarCheck size={14} />
                <span>Book A Table</span>
              </Link>
            </div>

            {/* Watch Lookbook Link */}
            <div className="pt-6">
              <button
                onClick={() => setLookbookOpen(true)}
                className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-charcoal/70 hover:text-charcoal transition-colors"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-charcoal text-white group-hover:scale-110 transition-transform">
                  <Play size={10} fill="currentColor" className="ml-0.5" />
                </span>
                <span>WATCH LOOKBOOK</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: CIRCULAR FOOD PLATE & FLOATING COUPON CARD */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col items-center justify-center min-h-[360px] sm:min-h-[460px] md:min-h-[500px]">
            
            {/* Ambient Circular Plate Glow */}
            <div
              className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-700"
              style={{ backgroundColor: current.themeColor }}
            />

            {/* The Ceramic Food Plate with entrance spin & float animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                {/* Continuous gentle floating physics */}
                <motion.div
                  animate={{
                    y: [-6, 6, -6],
                    rotate: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative cursor-pointer"
                  onClick={() => setLookbookOpen(true)}
                  title="Click to view culinary story & lookbook"
                >
                  {/* Plate Outer Rim & Shadow */}
                  <div className="relative mx-auto aspect-square w-64 sm:w-80 md:w-[380px] lg:w-[440px] xl:w-[480px] rounded-full p-3 sm:p-3.5 bg-gradient-to-br from-white via-[#F7F5F0] to-[#E5E0D5] shadow-[0_30px_70px_rgba(0,0,0,0.22),0_10px_25px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
                    {/* Inner Plate Ceramic Recess */}
                    <div className="relative h-full w-full rounded-full overflow-hidden shadow-inner border border-white/60">
                      <img
                        src={current.plateImg}
                        alt={current.title}
                        className="h-full w-full object-cover rounded-full filter contrast-[1.06] brightness-[1.02] transform transition-transform duration-700 hover:scale-105"
                      />
                      {/* Porcelain Light Glaze Reflection */}
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/25" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Floating Discount Coupon Card (Matching Bottom-Right from Reference) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 lg:mt-0 lg:absolute lg:bottom-0 lg:right-6 z-30 w-full max-w-[280px] rounded-2xl bg-white border border-sand/80 shadow-xl p-3.5"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-sand/50">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-charcoal/50">
                  DISCOUNT COUPON
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal/60">
                  <button
                    onClick={() => changeSlide(-1)}
                    className="hover:text-charcoal transition-colors px-1"
                    title="Previous Slide"
                  >
                    &lt; PREV
                  </button>
                  <span className="text-sand/70">|</span>
                  <button
                    onClick={() => changeSlide(1)}
                    className="hover:text-charcoal transition-colors px-1"
                    title="Next Slide"
                  >
                    NEXT &gt;
                  </button>
                </div>
              </div>

              {/* Coupon Content */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-sand/60">
                  <img
                    src={current.coupon.thumb}
                    alt={current.coupon.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-xs text-charcoal truncate">
                    {current.coupon.title}
                  </p>
                  <p className="text-[10px] text-charcoal/50 font-medium">
                    {current.coupon.portion} • <strong className="text-charcoal font-bold">${current.coupon.price.toFixed(2)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleClaimCoupon(current.coupon.code, current.coupon.discount)}
                  className="rounded-full bg-[#F5B800] hover:bg-[#E5AC00] active:scale-95 text-charcoal text-[9px] font-extrabold uppercase px-2.5 py-1.5 shadow-sm transition-all shrink-0"
                >
                  {claimedCodes[current.coupon.code] ? "CLAIMED ✓" : "GET COUPON"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DISH SLIDE CONTROLS & PAGINATION PILLS (HERO SECTION)    */}
        {/* ======================================================== */}
        <div className="flex items-center justify-center gap-3 pt-8 pb-2">
          {SLIDES.map((slide, i) => {
            const isActive = i === index;
            return (
              <button
                key={slide.id}
                onClick={() => {
                  setIndex(i);
                  setSize("medium");
                }}
                aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                className="group relative flex items-center justify-center py-2 px-1 focus:outline-none"
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-2.5 w-10 shadow-md ring-2 ring-offset-2 ring-offset-white"
                      : "h-2.5 w-2.5 opacity-40 hover:opacity-80 hover:scale-125"
                  }`}
                  style={{
                    backgroundColor: slide.themeColor,
                    ...(isActive ? ({ "--tw-ring-color": slide.themeColor } as any) : {}),
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* LOOKBOOK MODAL (Activated by 'WATCH LOOKBOOK' button)    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {lookbookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white border border-sand p-6 sm:p-8 shadow-2xl text-charcoal overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setLookbookOpen(false)}
                className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-sand/30 text-charcoal hover:bg-charcoal hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-charcoal/50">
                <Sparkles size={14} style={{ color: current.themeColor }} />
                <span>Culinary Lookbook & Story</span>
              </div>

              <h3
                className="font-serif text-3xl sm:text-4xl font-bold lowercase"
                style={{ color: current.themeColor }}
              >
                {current.title}
              </h3>

              {/* Lookbook Hero Graphic */}
              <div className="relative my-6 aspect-video w-full rounded-2xl overflow-hidden shadow-md">
                <img
                  src={current.plateImg}
                  alt={current.title}
                  className="h-full w-full object-cover filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                  <p className="text-white text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                    {current.lookbook.notes}
                  </p>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sand/60 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-charcoal/50 text-[10px]">
                    Culinary Technique:
                  </span>
                  <p className="text-charcoal font-medium mt-0.5">
                    {current.lookbook.technique}
                  </p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-charcoal/50 text-[10px]">
                    Sommelier Wine Pairing:
                  </span>
                  <p className="text-charcoal font-medium mt-0.5">
                    {current.lookbook.pairing}
                  </p>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="mt-6 pt-4 flex items-center justify-between gap-4 border-t border-sand/60">
                <span className="font-serif text-xl font-bold text-charcoal">
                  ${activePrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart();
                      setLookbookOpen(false);
                    }}
                    style={{ backgroundColor: current.themeColor }}
                    className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-105 transition-all shadow"
                  >
                    Add To Cart
                  </button>
                  <button
                    onClick={() => setLookbookOpen(false)}
                    className="rounded-full border border-sand px-5 py-2.5 text-xs font-bold text-charcoal hover:bg-sand/30 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
