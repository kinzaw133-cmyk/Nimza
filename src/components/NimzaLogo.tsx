"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export type LogoVariant = "header" | "circle" | "pebble" | "monogram" | "minimal" | "badge";

interface NimzaLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showSubtitle?: boolean;
  animated?: boolean;
  inverted?: boolean; // True when on dark background (Admin sidebar, Splash screen, Dark Hero)
}

/**
 * Retro-Organic Steaming Cloche / Bowl SVG Emblem
 * Deep Charcoal Olive (#1F241F) with Heart Cutout & Warm Gold (#B99A5B) Steam Swirl
 * Transparent background
 */
export function NimzaBowlSvg({
  className = "w-6 h-6",
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const bowlFill = inverted ? "#FAFAF8" : "#1F241F";
  const heartFill = inverted ? "#1F241F" : "#FAFAF8";

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Steam Swirl in Luxury Gold */}
      <path
        d="M 50 14 Q 57 23 48 31 Q 40 39 50 45"
        fill="none"
        stroke="#B99A5B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Gold Rim Line */}
      <ellipse cx="50" cy="50" rx="34" ry="5.5" fill="#B99A5B" />
      {/* Bowl Body */}
      <path
        d="M 16 50 C 16 85, 84 85, 84 50 Z"
        fill={bowlFill}
      />
      {/* Heart Cutout */}
      <path
        d="M 50 72 C 48.5 70, 40 62, 40 56.5 C 40 52.5, 43.5 50.5, 46.5 50.5 C 48.5 50.5, 50 52.5, 50 52.5 C 50 52.5, 51.5 50.5, 53.5 50.5 C 56.5 50.5, 60 52.5, 60 56.5 C 60 62, 51.5 70, 50 72 Z"
        fill={heartFill}
      />
    </svg>
  );
}

/**
 * Botanical Leaf SVG (Preserved for backwards-compatibility)
 */
export function BotanicalLeafSvg({ className = "w-6 h-6 text-gold" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5C578" />
          <stop offset="50%" stopColor="#B99A5B" />
          <stop offset="100%" stopColor="#8E723B" />
        </linearGradient>
      </defs>
      <path
        d="M24 44C24 44 23 30 14 22C5 14 4 4 4 4C4 4 14 5 22 14C30 23 24 44 24 44Z"
        fill="url(#leafGrad)"
        opacity="0.9"
      />
      <path
        d="M24 44C24 44 25 32 34 26C43 20 44 11 44 11C44 11 35 12 28 19C21 26 24 44 24 44Z"
        fill="url(#leafGrad)"
      />
      <path
        d="M24 44C24 36 22 28 18 20M24 44C25 38 28 32 33 27"
        stroke="#F7F4EC"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export default function NimzaLogo({
  variant = "header",
  className = "",
  size = "md",
  href,
  showSubtitle = true,
  animated = false,
  inverted = false,
}: NimzaLogoProps) {
  const content = (() => {
    switch (variant) {
      case "circle": {
        const circleSrc = inverted ? "/logo-circle-light.png" : "/logo-circle.png";
        return (
          <div className={`relative inline-flex items-center justify-center bg-transparent ${className}`}>
            <img
              src={circleSrc}
              alt="Nimza Restaurant Seal"
              className={`w-auto object-contain bg-transparent transition-transform duration-500 hover:scale-105 ${
                size === "sm" ? "h-11 w-11" : size === "lg" ? "h-24 w-24" : size === "xl" ? "h-32 w-32" : "h-16 w-16"
              }`}
            />
          </div>
        );
      }

      case "pebble": {
        const logoSrc = inverted ? "/logo-light.png" : "/logo.png";
        return (
          <div className={`relative inline-flex items-center justify-center bg-transparent ${className}`}>
            <img
              src={logoSrc}
              alt="Nimza Restaurant Emblem"
              className={`w-auto object-contain bg-transparent transition-transform duration-500 hover:scale-105 ${
                size === "sm" ? "h-12" : size === "lg" ? "h-24" : size === "xl" ? "h-32" : "h-16"
              }`}
            />
          </div>
        );
      }

      case "monogram":
        return (
          <div className={`relative inline-flex items-center justify-center bg-transparent ${className}`}>
            <div className="relative flex items-center justify-center">
              <span
                className={`font-serif font-black tracking-tight select-none ${
                  inverted ? "text-ivory" : "text-[#1F241F]"
                } ${
                  size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : size === "xl" ? "text-7xl" : "text-4xl"
                }`}
              >
                N
              </span>
              <div
                className={`absolute -right-2 -top-1 pointer-events-none ${
                  size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : size === "xl" ? "w-10 h-10" : "w-6 h-6"
                }`}
              >
                <NimzaBowlSvg className="w-full h-full" inverted={inverted} />
              </div>
            </div>
          </div>
        );

      case "minimal":
        return (
          <div className={`inline-flex items-center gap-2 bg-transparent ${className}`}>
            <NimzaBowlSvg className="w-5 h-5 text-gold shrink-0" inverted={inverted} />
            <span
              className={`font-serif font-bold text-lg tracking-[0.15em] ${
                inverted ? "text-ivory" : "text-[#1F241F]"
              }`}
            >
              Nimza
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-gold">
              Restaurant
            </span>
          </div>
        );

      case "badge": {
        // Clean transparent badge without any white background boxes
        if (size === "sm") {
          return (
            <div className={`inline-flex items-center justify-center bg-transparent ${className}`}>
              <NimzaBowlSvg className="w-8 h-8" inverted={inverted} />
            </div>
          );
        }
        return (
          <div
            className={`inline-flex flex-col items-center justify-center bg-transparent p-2 text-center select-none ${className}`}
          >
            <div className="w-7 h-7 mb-1">
              <NimzaBowlSvg className="w-full h-full" inverted={inverted} />
            </div>
            <div className="flex items-center gap-1 text-gold mb-0.5">
              <span className="text-[9px]">★</span>
              <span className="text-[9px]">★</span>
              <span className="text-[9px]">★</span>
            </div>
            <span
              className={`font-serif text-base font-black tracking-widest ${
                inverted ? "text-ivory" : "text-[#1F241F]"
              }`}
            >
              NIMZA
            </span>
            {showSubtitle && (
              <span className="text-[8px] font-bold tracking-[0.25em] uppercase text-gold mt-0.5">
                Kitchen &amp; Lounge
              </span>
            )}
          </div>
        );
      }

      case "header":
      default: {
        const headerSrc = inverted ? "/logo-header-light.png" : "/logo-header.png";
        return (
          <div className={`inline-flex items-center select-none bg-transparent ${className}`}>
            <img
              src={headerSrc}
              alt="Nimza Restaurant"
              className={`w-auto object-contain bg-transparent transition-transform duration-300 hover:scale-105 ${
                size === "sm" ? "h-9 sm:h-10" : size === "lg" ? "h-18" : size === "xl" ? "h-24" : "h-12"
              }`}
            />
          </div>
        );
      }
    }
  })();

  const wrapper = animated ? (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="inline-block bg-transparent"
    >
      {content}
    </motion.div>
  ) : (
    content
  );

  if (href) {
    return (
      <Link href={href} aria-label="Nimza Restaurant Home" className="focus:outline-none bg-transparent">
        {wrapper}
      </Link>
    );
  }

  return wrapper;
}
