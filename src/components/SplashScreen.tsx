"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Stepped progression exactly as required: 0 -> 30 -> 60 -> 90 -> 100 -> complete
    setProgress(0);

    const timeouts: NodeJS.Timeout[] = [];

    // Stage 1: 0% -> at start (0ms)
    // Stage 2: 30% -> at 400ms
    const t1 = setTimeout(() => {
      setProgress(30);
    }, 400);
    timeouts.push(t1);

    // Stage 3: 60% -> at 850ms
    const t2 = setTimeout(() => {
      setProgress(60);
    }, 850);
    timeouts.push(t2);

    // Stage 4: 90% -> at 1300ms
    const t3 = setTimeout(() => {
      setProgress(90);
    }, 1300);
    timeouts.push(t3);

    // Stage 5: 100% -> at 1750ms
    const t4 = setTimeout(() => {
      setProgress(100);
    }, 1750);
    timeouts.push(t4);

    // Stage 6: Fade out and dismiss after showing 100%
    const t5 = setTimeout(() => {
      triggerDismiss();
    }, 2250);
    timeouts.push(t5);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const triggerDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 450);
  };

  const handleSkip = () => {
    triggerDismiss();
  };

  if (!isVisible) return null;

  // Exact percentage string (0%, 30%, 60%, 90%, 100%)
  const percentageStr = `${progress}%`;

  // Calculate blur from 16px down to 0px based on stepped progress
  const blurAmount = Math.max(0, 16 * (1 - progress / 100));
  const logoOpacity = Math.min(1, Math.max(0.2, progress / 90));

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="splash-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1F241F] text-ivory select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#B99A5B]/10 blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#B99A5B_1px,transparent_1px)] opacity-[0.06] [background-size:32px_32px]" />
          </div>

          {/* Skip Action (Top Right) */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[11px] font-sans uppercase tracking-[0.25em] text-sand/50 hover:text-gold transition-colors py-1.5 px-3 rounded-full border border-white/10 hover:border-gold/40 z-20 cursor-pointer"
          >
            Skip ↗
          </button>

          {/* Center Stage: 3D Cloche Halo + Morphing Shape + Logo Reveal */}
          <div className="relative flex flex-col items-center justify-center z-10 px-6 max-w-sm w-full text-center">
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

              {/* Morphing Shape that transforms into the Logo container */}
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
                  duration: 2.2,
                  times: [0, 0.35, 0.7, 1],
                  ease: "easeInOut",
                }}
                className="absolute inset-4 overflow-hidden bg-transparent border-2 border-gold/50 shadow-[0_0_35px_rgba(185,154,91,0.25)] flex items-center justify-center p-3"
              >
                {/* Logo Reveal: dynamically unblurs as progress steps */}
                <div
                  style={{
                    filter: `blur(${blurAmount}px)`,
                    opacity: logoOpacity,
                    transition: "filter 0.4s ease, opacity 0.4s ease",
                  }}
                  className="w-full h-full flex items-center justify-center bg-transparent"
                >
                  <img
                    src="/logo-light.png"
                    alt="Nimza Restaurant Logo"
                    className="w-full h-full object-contain bg-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress >= 30 ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.15em] text-ivory">
                NIMZA
              </h2>
              <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.35em] text-gold uppercase mt-1">
                Fine Dining &amp; Lounge
              </p>
            </motion.div>

            {/* Stepped Percentage Loader: 0% -> 30% -> 60% -> 90% -> 100% */}
            <div className="w-full max-w-xs space-y-3" suppressHydrationWarning>
              <div className="flex items-center justify-between text-xs font-mono tracking-widest" suppressHydrationWarning>
                <span className="text-[10px] uppercase tracking-[0.25em] text-sand/60" suppressHydrationWarning>
                  {progress < 100 ? "Loading Sanctuary" : "Welcome, Connoisseur"}
                </span>
                <span className="text-gold font-bold text-sm transition-all duration-300" suppressHydrationWarning>
                  {percentageStr}
                </span>
              </div>

              {/* Slender Gold Progress Bar with stepped animation */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0 relative shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold/60 via-gold to-[#F5DF9E] rounded-full shadow-[0_0_12px_rgba(185,154,91,0.8)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
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
