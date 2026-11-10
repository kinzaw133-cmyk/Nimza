"use client";

import React from "react";
import Image from "next/image";
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
}

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
}: NimzaLogoProps) {
  const content = (() => {
    switch (variant) {
      case "circle":
        return (
          <div className={`relative inline-flex items-center justify-center ${className}`}>
            <div className="relative overflow-hidden rounded-full p-1 border border-gold/40 shadow-lg bg-ivory/95 transition-transform duration-500 hover:scale-105 hover:border-gold">
              <img
                src="/logo-circle.jpg"
                alt="Nimza Restaurant Seal"
                className={`w-auto mix-blend-multiply object-contain ${
                  size === "sm" ? "h-12" : size === "lg" ? "h-24" : size === "xl" ? "h-32" : "h-16"
                }`}
              />
            </div>
          </div>
        );

      case "pebble":
        return (
          <div className={`relative inline-flex items-center justify-center ${className}`}>
            <div className="relative overflow-hidden transition-transform duration-500 hover:scale-105">
              <img
                src="/logo-footer.jpg"
                alt="Nimza Organic Emblem"
                className={`w-auto object-contain drop-shadow-md ${
                  size === "sm" ? "h-14" : size === "lg" ? "h-28" : size === "xl" ? "h-36" : "h-20"
                }`}
              />
            </div>
          </div>
        );

      case "monogram":
        return (
          <div className={`relative inline-flex items-center justify-center ${className}`}>
            <div className="relative flex items-center justify-center">
              <span className={`font-serif font-bold text-olive select-none ${
                size === "sm" ? "text-3xl" : size === "lg" ? "text-6xl" : size === "xl" ? "text-8xl" : "text-5xl"
              }`}>
                N
              </span>
              <div className={`absolute -right-2 -top-1 pointer-events-none ${
                size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : size === "xl" ? "w-11 h-11" : "w-6 h-6"
              }`}>
                <BotanicalLeafSvg className="w-full h-full" />
              </div>
            </div>
          </div>
        );

      case "minimal":
        return (
          <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <span className="font-serif font-bold text-xl tracking-[0.25em] text-olive uppercase">
              Nimza
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-charcoal/70">
              Lounge
            </span>
          </div>
        );

      case "badge":
        return (
          <div className={`inline-flex flex-col items-center justify-center rounded-3xl border border-gold/40 bg-gradient-to-b from-ivory to-sand/40 p-4 shadow-sm text-center ${className}`}>
            <div className="flex items-center gap-1.5 text-gold mb-1">
              <span className="text-xs">★</span>
              <span className="text-xs">★</span>
              <span className="text-xs">★</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-widest text-olive">NIMZA</span>
            {showSubtitle && (
              <span className="text-[10px] tracking-[0.3em] uppercase text-charcoal/70 mt-0.5">
                Fine Dining & Lounge
              </span>
            )}
          </div>
        );

      case "header":
      default:
        return (
          <div className={`inline-flex items-center gap-3 select-none ${className}`}>
            <div className="relative overflow-hidden rounded-xl bg-ivory/80 transition-transform duration-300 hover:scale-105">
              <img
                src="/logo-header.jpg"
                alt="Nimza Restaurant"
                className={`w-auto mix-blend-multiply object-contain ${
                  size === "sm" ? "h-11" : size === "lg" ? "h-20" : size === "xl" ? "h-28" : "h-14"
                }`}
              />
            </div>
          </div>
        );
    }
  })();

  const wrapper = animated ? (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="inline-block"
    >
      {content}
    </motion.div>
  ) : (
    content
  );

  if (href) {
    return (
      <Link href={href} aria-label="Nimza Restaurant Home" className="focus:outline-none">
        {wrapper}
      </Link>
    );
  }

  return wrapper;
}
