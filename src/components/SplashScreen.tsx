"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function SplashScreen({ onComplete, forceShow = false }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Check if user has already seen splash screen in this session
    if (!forceShow && typeof window !== "undefined") {
      const hasSeen = sessionStorage.getItem("nimza_splash_seen");
      if (hasSeen === "true") {
        setIsVisible(false);
        onComplete?.();
        return;
      }
    }

    // Smooth percentage progression: 0% -> 100% over ~2.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            triggerDismiss();
          }, 350);
          return 100;
        }
        // Slightly non-linear acceleration for natural feel
        const step = prev < 30 ? 1.4 : prev < 70 ? 2.2 : 1.8;
        return Math.min(100, prev + step);
      });
    }, 35);

    return () => clearInterval(interval);
  }, [forceShow]);

  const triggerDismiss = () => {
    setIsDismissing(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nimza_splash_seen", "true");
    }
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 700);
  };

  const handleSkip = () => {
    triggerDismiss();
  };

  if (!isVisible) return null;

  // Formatted percentage string (e.g. 00%, 07%, 42%, 100%)
  const percentageStr = String(Math.floor(progress)).padStart(2, "0") + "%";

  // Calculate blur from 18px down to 0px based on progress
  const blurAmount = Math.max(0, 18 * (1 - progress / 85));
  const logoOpacity = Math.min(1, Math.max(0, (progress - 15) / 65));

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#111611] text-ivory select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#B99A5B]/10 blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#B99A5B_1px,transparent_1px)] opacity-[0.06] [background-size:32px_32px]" />
          </div>

          {/* Skip Action (Top Right) */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[11px] font-sans uppercase tracking-[0.25em] text-sand/50 hover:text-gold transition-colors py-1.5 px-3 rounded-full border border-white/10 hover:border-gold/40 z-20"
          >
            Skip ↗
          </button>

          {/* Center Stage: 3D Loading + Morphing Shape + Logo Reveal */}
          <div className="relative flex flex-col items-center justify-center z-10 px-6 max-w-sm w-full text-center">
            {/* 1. 3D OBJECT LOADING & 2. MORPHING ANIMATION CONTAINER */}
            <div className="relative mb-8 [perspective:1000px] flex items-center justify-center">
              {/* 3D Rotating Gold Cloche / Seal Halo */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  rotateX: [8, -8, 8],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border border-gold/30 flex items-center justify-center relative p-1 shadow-[0_0_50px_rgba(185,154,91,0.2)]"
              >
                {/* 3D Orbiting Ring Accent */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-gold/40 pointer-events-none"
                  style={{
                    transform: "rotateX(75deg)",
                  }}
                />

                {/* 3D Rotating Golden Cloche Specular Coin */}
                <div
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-gold/20 via-transparent to-gold/10 pointer-events-none"
                  style={{
                    transform: "translateZ(15px)",
                  }}
                />
              </motion.div>

              {/* 2. MORPHING SHAPE THAT TRANSFORMS INTO THE LOGO CONTAINER */}
              <motion.div
                animate={{
                  borderRadius: [
                    "50% 50% 50% 50%",
                    "40% 60% 65% 35% / 40% 45% 55% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "24px",
                  ],
                }}
                transition={{
                  duration: 3,
                  times: [0, 0.35, 0.7, 1],
                  ease: "easeInOut",
                }}
                className="absolute inset-4 overflow-hidden bg-[#FAF7F0] border-2 border-gold/60 shadow-2xl flex items-center justify-center p-3"
              >
                {/* 1. LOGO REVEAL: GRADUALLY APPEARS WITH BLUR & OPACITY */}
                <motion.div
                  style={{
                    filter: `blur(${blurAmount}px)`,
                    opacity: logoOpacity,
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src="/logo-footer.jpg"
                    alt="Nimza Restaurant Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Brand Title (Fades in softly) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress > 30 ? 1 : 0.2, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.15em] text-ivory">
                NIMZA
              </h2>
              <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.35em] text-gold uppercase mt-1">
                Fine Dining &amp; Lounge
              </p>
            </motion.div>

            {/* 3. PERCENTAGE LOADER: 00% -> 100% */}
            <div className="w-full max-w-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono tracking-widest">
                <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60">
                  {progress < 100 ? "Loading Sanctuary" : "Welcome, Connoisseur"}
                </span>
                <span className="text-gold font-bold text-sm">{percentageStr}</span>
              </div>

              {/* Slender Gold Progress Bar */}
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-0 relative shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold/60 via-gold to-[#F5DF9E] rounded-full shadow-[0_0_12px_rgba(185,154,91,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              <p className="text-[9px] uppercase tracking-[0.25em] text-sand/40 pt-1">
                Budapest • Lyon • Milan
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
