"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  CalendarCheck,
  Sparkles,
  PhoneCall,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "./Cart";
import { toast } from "@/lib/notify";
import NimzaLogo from "./NimzaLogo";

export default function Navbar() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Reservations", href: "/reservations" },
    { label: "Contact", href: "/contact" },
    ...(user ? [{ label: "My Orders", href: "/orders" }] : []),
    ...(role === "admin"
      ? [
          { label: "Admin Menu", href: "/admin/menu" },
          { label: "Admin Orders", href: "/admin/orders" },
        ]
      : []),
  ];

  const handleReplaySplash = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nimza_splash_seen");
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast("Logged out securely", "info");
    window.location.href = "/";
  };

  const isHome = pathname === "/";
  const headerBg = scrolled
    ? "bg-ivory/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-gold/30 py-2.5"
    : isHome
    ? "bg-gradient-to-b from-olive-deep/80 via-olive/50 to-transparent text-ivory py-4 border-b border-white/10"
    : "bg-ivory/90 backdrop-blur-md border-b border-gold/20 py-3";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
          {/* Brand Logo with Gentle Tilt */}
          <Link href="/" className="group flex items-center gap-2 focus:outline-none">
            <div className="relative rounded-xl bg-ivory/90 p-1 border border-gold/30 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-gold">
              <NimzaLogo variant="header" size="sm" />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
            {navLinks.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <li key={href} className="relative">
                  <Link
                    href={href}
                    className={`transition-colors duration-300 py-1 inline-block ${
                      isActive
                        ? "text-gold font-bold"
                        : isHome && !scrolled
                        ? "text-ivory/90 hover:text-gold"
                        : "text-charcoal hover:text-gold"
                    }`}
                  >
                    {label}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Action Tools: Splash Replay, Table Booking, Cart, Auth, Hamburger */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Replay Splash Pill */}
            <button
              onClick={handleReplaySplash}
              title="Replay Brand Splash Experience"
              aria-label="Replay Brand Splash Screen"
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${
                isHome && !scrolled
                  ? "border-gold/40 text-sand hover:bg-gold/20 hover:text-gold"
                  : "border-gold/30 bg-sand/40 text-olive hover:bg-gold hover:text-charcoal"
              }`}
            >
              <Sparkles size={12} className="text-gold" />
              <span>Splash</span>
            </button>

            {/* Quick Table Reservation Button (Desktop) */}
            <Link
              href="/reservations"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm transition-all duration-300 hover:bg-gold-light hover:shadow-gold/30 hover:scale-105"
            >
              <CalendarCheck size={14} />
              <span>Book Table</span>
            </Link>

            {/* Shopping Cart Pill */}
            <Link
              href="/cart"
              aria-label={`Cart with ${count} items`}
              className={`relative grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ${
                isHome && !scrolled
                  ? "border border-white/20 text-ivory hover:border-gold hover:text-gold"
                  : "border border-sand bg-white text-olive hover:border-gold hover:text-gold shadow-sm"
              }`}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gold text-[10px] font-extrabold text-olive shadow"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* User Profile / Logout */}
            {user ? (
              <button
                onClick={handleSignOut}
                aria-label="Sign Out"
                title="Sign Out"
                className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ${
                  isHome && !scrolled
                    ? "border border-white/20 text-ivory hover:text-rose-300"
                    : "border border-sand bg-white text-olive hover:text-rose-600 shadow-sm"
                }`}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="VIP Sign In"
                title="VIP Sign In"
                className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ${
                  isHome && !scrolled
                    ? "border border-white/20 text-ivory hover:border-gold hover:text-gold"
                    : "border border-sand bg-white text-olive hover:border-gold hover:text-gold shadow-sm"
                }`}
              >
                <User size={18} />
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              className={`lg:hidden grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ${
                isHome && !scrolled
                  ? "border border-white/20 text-ivory"
                  : "border border-sand bg-white text-charcoal shadow-sm"
              }`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Fullscreen Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-olive-deep text-ivory pt-24 px-6 pb-8 lg:hidden overflow-y-auto"
          >
            {/* Top Seal */}
            <div className="flex justify-center mb-6">
              <NimzaLogo variant="circle" size="md" />
            </div>

            {/* Links List */}
            <div className="flex flex-col gap-2 my-auto">
              {navLinks.map(({ label, href }, idx) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 px-4 rounded-2xl text-xl font-serif tracking-wide transition-all ${
                      pathname === href
                        ? "bg-gold font-bold text-charcoal"
                        : "text-ivory hover:bg-olive hover:text-gold"
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons in Drawer */}
            <div className="pt-6 border-t border-gold/20 flex flex-col gap-3">
              <Link
                href="/reservations"
                onClick={() => setMobileOpen(false)}
                className="btn w-full"
              >
                <CalendarCheck size={18} />
                <span>Reserve a Table</span>
              </Link>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleReplaySplash();
                }}
                className="btn-o w-full !text-xs !py-2.5"
              >
                <Sparkles size={14} className="text-gold" />
                <span>Replay Animated Brand Splash</span>
              </button>

              <div className="mt-4 flex items-center justify-between text-xs text-sand/60">
                <span className="flex items-center gap-1.5">
                  <PhoneCall size={12} /> +92 300 0000000
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Open Daily 12:00
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
