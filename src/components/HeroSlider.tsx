"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, CalendarCheck, Utensils } from "lucide-react";
import Img from "./Img";
import { BotanicalLeafSvg } from "./NimzaLogo";

const U = (id: string) => `https://images.unsplash.com/${id}?w=1920&q=85`;

const SLIDES = [
  {
    tag: "Artisanal Fine Dining",
    badge: "Michelin Selection 2024",
    t: "Dining, seen differently.",
    p: "Seasonal organic produce, ancient wood-fire techniques, and quiet culinary confidence.",
    img: "photo-1414235077428-338989a2e8c0",
  },
  {
    tag: "Open Fire Rotisserie",
    badge: "Prime Dry-Aged Cuts",
    t: "Fire, patience, and true flavour.",
    p: "Heritage beef aged in-house, delicate coastal catch, and wild herbs kissed by embers.",
    img: "photo-1544025162-d76694265947",
  },
  {
    tag: "Hand-Crafted Pasta Room",
    badge: "Black Truffle Speciality",
    t: "Pasta, shaped with devotion.",
    p: "Fresh durum dough rolled each morning, real Umbrian black truffle, and 36-month aged Parmigiano.",
    img: "photo-1473093295043-cdd812d0e601",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [index, isPaused]);

  const changeSlide = (delta: number) => {
    setIndex((prev) => (prev + delta + SLIDES.length) % SLIDES.length);
  };

  const current = SLIDES[index];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[95vh] lg:min-h-screen overflow-hidden bg-olive-deep text-ivory flex items-center"
    >
      {/* Background Slides with Ken Burns Scale Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Img
            src={U(current.img)}
            alt={current.t}
            className="h-full w-full object-cover filter brightness-[0.72] contrast-[1.08]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Atmospheric Gradients & Texture */}
      <div className="absolute inset-0 bg-gradient-to-t from-olive-deep via-olive-deep/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-olive-deep/90 via-olive-deep/40 to-transparent" />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="glass-dark rounded-[2.5rem] p-8 md:p-14 border border-gold/30 shadow-2xl relative overflow-hidden"
            >
              {/* Floating Botanical Leaf Accents in corner */}
              <div className="absolute top-6 right-6 w-12 h-12 opacity-30 pointer-events-none text-gold">
                <BotanicalLeafSvg className="w-full h-full" />
              </div>

              {/* Tag & Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-xs font-semibold tracking-widest text-gold uppercase">
                  <Sparkles size={12} />
                  {current.badge}
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-sand/80 font-medium">
                  {current.tag}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ivory leading-[1.08]">
                {current.t}
              </h1>

              {/* Paragraph */}
              <p className="mt-5 text-base sm:text-xl text-sand/90 font-light max-w-xl leading-relaxed">
                {current.p}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/menu" className="btn flex items-center gap-2">
                  <Utensils size={16} />
                  <span>Explore Menu</span>
                </Link>
                <Link href="/reservations" className="btn-o flex items-center gap-2">
                  <CalendarCheck size={16} />
                  <span>Reserve a Table</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls & Progress */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-ivory max-w-3xl px-2">
            <div className="flex items-center gap-3">
              <button
                aria-label="Previous Slide"
                onClick={() => changeSlide(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-olive-deep/70 backdrop-blur-md text-sand hover:bg-gold hover:text-charcoal transition-all shadow"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                aria-label="Next Slide"
                onClick={() => changeSlide(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-olive-deep/70 backdrop-blur-md text-sand hover:bg-gold hover:text-charcoal transition-all shadow"
              >
                <ArrowRight size={18} />
              </button>
              <div className="ml-2 font-serif text-lg tracking-widest">
                <span className="text-gold font-bold">0{index + 1}</span>
                <span className="text-sand/50"> / 0{SLIDES.length}</span>
              </div>
            </div>

            {/* Slide Trackers */}
            <div className="flex items-center gap-2.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Jump to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-14 bg-gold shadow-sm shadow-gold/50" : "w-6 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
