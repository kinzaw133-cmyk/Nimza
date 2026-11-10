"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotanicalLeafSvg } from "./NimzaLogo";

interface SplashScreenProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function SplashScreen({ onComplete, forceShow = false }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Check session storage so users aren't interrupted on every subpage reload
    if (!forceShow && typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("nimza_splash_seen");
      if (hasSeen === "true") {
        setIsVisible(false);
        onComplete?.();
        return;
      }
    }

    // Progress bar ticker
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            handleDismiss();
          }, 400);
          return 100;
        }
        return prev + 2.5;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [forceShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nimza_splash_seen", "true");
    }
    setTimeout(() => {
      onComplete?.();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-olive-deep text-ivory select-none"
        >
          {/* Ambient Radial Glow & Background Particles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(185,154,91,0.22)_0%,rgba(23,29,15,0.95)_65%,rgba(15,19,10,1)_100%)]" />

          {/* Subtle Golden Ambient Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B99A5B_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Central Logo Box */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-md w-full">
            {/* Animated Golden Laurel / Ring Container */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-6 flex items-center justify-center"
            >
              {/* Outer Golden Ring */}
              <div className="relative p-3 rounded-full border-2 border-gold/40 shadow-2xl shadow-gold/20 bg-ivory/95 overflow-hidden">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.9 }}
                >
                  <img
                    src="/logo-circle.jpg"
                    alt="Nimza Seal"
                    className="h-28 w-28 md:h-36 md:md-36 object-contain mix-blend-multiply drop-shadow-md"
                  />
                </motion.div>

                {/* Shimmer Sweep Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
                  initial={{ x: "-150%" }}
                  animate={{ x: "200%" }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.5 }}
                />
              </div>

              {/* Floating Decorative Gold Leaves */}
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20, y: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                className="absolute -top-3 -right-3 w-8 h-8 text-gold drop-shadow-lg"
              >
                <BotanicalLeafSvg className="w-full h-full" />
              </motion.div>
            </motion.div>

            {/* Brand Title: N I M Z A with tracking expansion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-[0.35em] text-ivory text-gold-foil">
                NIMZA
              </h1>

              {/* Decorative Gold Flourish Line */}
              <div className="my-3 flex items-center gap-3 w-48 justify-center">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-gold to-gold"
                />
                <span className="text-gold text-xs">◆</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="h-[1px] bg-gradient-to-l from-transparent via-gold to-gold"
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-sans text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-sand/90"
              >
                Fine Dining & Lounge
              </motion.p>
            </motion.div>

            {/* Progress Bar & Status */}
            <div className="mt-8 w-64 max-w-full">
              <div className="h-1 w-full overflow-hidden rounded-full bg-olive-light/50 border border-gold/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold via-gold-shimmer to-gold"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-sans tracking-widest text-sand/70 uppercase">
                <span>Curating Ambience</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Quick Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleDismiss}
              className="mt-6 rounded-full border border-gold/30 px-5 py-1.5 text-xs tracking-widest text-sand/80 uppercase transition-all duration-300 hover:border-gold hover:text-gold hover:bg-gold/10"
            >
              Enter Experience →
            </motion.button>
          </div>

          {/* Footer Accreditation */}
          <div className="absolute bottom-6 text-center text-[10px] tracking-widest text-sand/50 uppercase">
            Artisanal Dining • Michelin Standard • Budapest & Milan Heritage
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
