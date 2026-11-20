"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Star,
  Crown,
  Navigation,
  Compass,
} from "lucide-react";

interface SectionItem {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  themeColor: string;
}

const SECTIONS: SectionItem[] = [
  {
    id: "hero-section",
    label: "Signature Atelier",
    subtitle: "Wood-fire plates & daily harvest",
    icon: Compass,
    themeColor: "#C8322B",
  },
  {
    id: "philosophy-section",
    label: "Botanical Philosophy",
    subtitle: "Patience & reverence",
    icon: Sparkles,
    themeColor: "#B99A5B",
  },
  {
    id: "collection-section",
    label: "Signature Collection",
    subtitle: "Curated epicurean journey",
    icon: UtensilsCrossed,
    themeColor: "#C8322B",
  },
  {
    id: "chef-section",
    label: "Meet Chef Elias",
    subtitle: "Central European gastronomy",
    icon: ChefHat,
    themeColor: "#B99A5B",
  },
  {
    id: "reviews-section",
    label: "Guest Accolades",
    subtitle: "Dining experiences & ratings",
    icon: Star,
    themeColor: "#E59819",
  },
  {
    id: "vip-section",
    label: "VIP Dining Table",
    subtitle: "Table reservation & cellar",
    icon: Crown,
    themeColor: "#B99A5B",
  },
  {
    id: "footer-section",
    label: "Delivery Radar & Footer",
    subtitle: "30-min fast courier challenge",
    icon: Navigation,
    themeColor: "#C8322B",
  },
];

export default function ScrollNavigator() {
  const [activeSection, setActiveSection] = useState<string>("hero-section");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position & update active section + vertical progress rail
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);

      // Determine active section based on scroll offset
      const isAtBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        setActiveSection("footer-section");
        return;
      }

      const viewportMiddle = scrollY + window.innerHeight * 0.35;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (viewportMiddle >= top - 20) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth animated scroll to section
  const scrollToSection = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      const targetTop = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  }, []);

  // Navigate up/down with animated step
  const handleStep = useCallback(
    (direction: "up" | "down") => {
      const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);
      if (currentIndex === -1) return;

      if (direction === "up" && currentIndex > 0) {
        scrollToSection(SECTIONS[currentIndex - 1].id);
      } else if (direction === "down" && currentIndex < SECTIONS.length - 1) {
        scrollToSection(SECTIONS[currentIndex + 1].id);
      }
    },
    [activeSection, scrollToSection]
  );

  // Wheel scroll listener on the scrollbar widget to smoothly step through sections
  const handleWidgetWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY > 20) {
      handleStep("down");
    } else if (e.deltaY < -20) {
      handleStep("up");
    }
  };

  if (!mounted) return null;

  const activeIndex = Math.max(0, SECTIONS.findIndex((s) => s.id === activeSection));
  const activeColor = SECTIONS[activeIndex]?.themeColor || "#B99A5B";

  return (
    <aside
      aria-label="Website Page Scroll Navigator"
      onWheel={handleWidgetWheel}
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center select-none"
    >
      {/* Scroll Up Button */}
      <motion.button
        type="button"
        onClick={() => handleStep("up")}
        disabled={activeIndex === 0}
        aria-label="Scroll to previous section"
        whileHover={{ scale: 1.15, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className={`mb-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 backdrop-blur-md border border-sand/80 shadow-md transition-all ${
          activeIndex === 0
            ? "opacity-30 cursor-not-allowed text-charcoal/40"
            : "text-[#1F241F] hover:bg-gold hover:text-white hover:border-gold cursor-pointer"
        }`}
      >
        <ChevronUp size={14} className="stroke-[2.5]" />
      </motion.button>

      {/* Main Luxury Pill Container */}
      <div className="relative flex flex-col items-center gap-3 py-3.5 px-2 rounded-full bg-white/85 backdrop-blur-md border border-sand/70 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
        {/* Animated Background Progress Fill Bar */}
        <div className="absolute inset-y-3.5 left-1/2 -translate-x-1/2 w-[2px] bg-sand/40 rounded-full pointer-events-none overflow-hidden">
          <motion.div
            className="w-full bg-gradient-to-b from-gold via-[#C8322B] to-gold rounded-full"
            style={{ height: `${scrollProgress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>

        {/* Section Indicator Dots */}
        {SECTIONS.map((section, idx) => {
          const isActive = section.id === activeSection;
          const isHovered = section.id === hoveredSection;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Interactive Dot Trigger */}
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                aria-label={`Scroll to ${section.label}`}
                className="relative grid place-items-center p-1.5 rounded-full group focus:outline-none transition-transform active:scale-90"
              >
                {/* Active Outer Ring / Pulse */}
                {isActive && (
                  <motion.div
                    layoutId="activeScrollRing"
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: section.themeColor }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}

                {/* Dot Sphere */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.25 : isHovered ? 1.4 : 1,
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-3 w-3 shadow-md"
                      : "h-2 w-2 opacity-50 group-hover:opacity-100 group-hover:scale-125"
                  }`}
                  style={{
                    backgroundColor: isActive ? section.themeColor : "#8E723B",
                  }}
                />
              </button>

              {/* Floating Slide-Out Tooltip on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={() => scrollToSection(section.id)}
                    className="absolute right-10 whitespace-nowrap px-3.5 py-1.5 rounded-2xl bg-[#1F241F]/95 backdrop-blur-md text-ivory border border-gold/40 shadow-xl flex items-center gap-2 cursor-pointer pointer-events-auto"
                  >
                    <div
                      className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${section.themeColor}33`, color: section.themeColor }}
                    >
                      <Icon size={12} />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-xs text-white block leading-tight">
                        {section.label}
                      </span>
                      <span className="text-[9px] text-sand/70 font-sans block leading-none">
                        {section.subtitle}
                      </span>
                    </div>
                    {/* Small Right Arrow Notch */}
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#1F241F] border-r border-t border-gold/40" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Scroll Down Button */}
      <motion.button
        type="button"
        onClick={() => handleStep("down")}
        disabled={activeIndex === SECTIONS.length - 1}
        aria-label="Scroll to next section"
        whileHover={{ scale: 1.15, y: 2 }}
        whileTap={{ scale: 0.9 }}
        className={`mt-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 backdrop-blur-md border border-sand/80 shadow-md transition-all ${
          activeIndex === SECTIONS.length - 1
            ? "opacity-30 cursor-not-allowed text-charcoal/40"
            : "text-[#1F241F] hover:bg-gold hover:text-white hover:border-gold cursor-pointer"
        }`}
      >
        <ChevronDown size={14} className="stroke-[2.5]" />
      </motion.button>

      {/* Scroll Percentage Badge */}
      <div className="mt-2 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-md border border-sand/60 text-[9px] font-mono font-bold text-charcoal/70 shadow-2xs">
        {Math.round(scrollProgress)}%
      </div>
    </aside>
  );
}
